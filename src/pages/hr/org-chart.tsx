import { useList, useTranslate } from "@refinedev/core";
import { Network } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EMPLOYEE_STATUSES, labelFor } from "./constants";
import { EnumBadge } from "./shared";
import type { DepartmentRecord, EmployeeRecord } from "./types";

type EmpNode = EmployeeRecord & { children: EmpNode[] };

// Builds a reporting-line tree from a flat list of employees (manager_id ->
// children), restricted to the employees passed in (usually one department's
// worth). Employees whose manager isn't in the same set become roots.
function buildReportingTree(employees: EmployeeRecord[]): EmpNode[] {
  const byId = new Map<string, EmpNode>();
  for (const employee of employees) {
    byId.set(String(employee.id), { ...employee, children: [] });
  }
  const roots: EmpNode[] = [];
  for (const node of byId.values()) {
    const managerId = node.manager_id != null ? String(node.manager_id) : null;
    const manager = managerId ? byId.get(managerId) : null;
    if (manager) {
      manager.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const byName = (a: EmpNode, b: EmpNode) => (a.name ?? "").localeCompare(b.name ?? "");
  const sortTree = (nodes: EmpNode[]) => {
    nodes.sort(byName);
    for (const node of nodes) sortTree(node.children);
  };
  sortTree(roots);
  return roots;
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function OrgChartPage() {
  const translate = useTranslate();
  const navigate = useNavigate();

  const { result: deptResult, query: deptQuery } = useList<DepartmentRecord>({
    resource: "hub_hr_departments",
    pagination: { mode: "server", currentPage: 1, pageSize: 300 },
    sorters: [{ field: "name", order: "asc" }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const { result: empResult, query: empQuery } = useList<EmployeeRecord>({
    resource: "hub_hr_employees",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const loading = deptQuery.isLoading || empQuery.isLoading;

  const sections = useMemo(() => {
    const byDept = new Map<string, EmployeeRecord[]>();
    const unassigned: EmployeeRecord[] = [];
    for (const employee of empResult.data) {
      const key = employee.department_id != null ? String(employee.department_id) : "";
      if (!key) {
        unassigned.push(employee);
        continue;
      }
      const bucket = byDept.get(key) ?? [];
      bucket.push(employee);
      byDept.set(key, bucket);
    }
    const deptSections = [...deptResult.data]
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
      .map((dept) => ({
        key: String(dept.id),
        name: dept.name || "—",
        code: dept.code || null,
        employees: byDept.get(String(dept.id)) ?? [],
      }))
      .filter((section) => section.employees.length > 0);
    return { deptSections, unassigned };
  }, [deptResult.data, empResult.data]);

  const openEmployee = (id: string | number) => navigate(`/employees/show/${id}`);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            {translate("hr.orgChart.title", { ns: "starter" }, "Org chart")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {translate(
              "hr.orgChart.subtitle",
              { ns: "starter" },
              "Who reports to whom, grouped by department. Click a person to open their profile."
            )}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState className="min-h-48" />
      ) : sections.deptSections.length === 0 && sections.unassigned.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {translate(
              "hr.orgChart.empty",
              { ns: "starter" },
              "No employees on file yet."
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.deptSections.map((section) => (
            <Card key={section.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="size-4 text-blue-600 dark:text-blue-400" />
                  {section.name}
                  {section.code ? (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {section.code}
                    </span>
                  ) : null}
                  <span className="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
                    {section.employees.length}{" "}
                    {section.employees.length === 1
                      ? translate("hr.departments.tree.person", { ns: "starter" }, "person")
                      : translate("hr.departments.tree.people", { ns: "starter" }, "people")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="flex flex-col gap-2">
                  {buildReportingTree(section.employees).map((root) => (
                    <EmployeeNode
                      key={String(root.id)}
                      node={root}
                      onOpen={openEmployee}
                      translate={translate}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {sections.unassigned.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="size-4 text-muted-foreground" />
                  {translate("hr.stats.unassigned", { ns: "starter" }, "Unassigned")}
                  <span className="ml-auto text-xs font-normal text-muted-foreground tabular-nums">
                    {sections.unassigned.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="flex flex-col gap-2">
                  {buildReportingTree(sections.unassigned).map((root) => (
                    <EmployeeNode
                      key={String(root.id)}
                      node={root}
                      onOpen={openEmployee}
                      translate={translate}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}

function EmployeeNode({
  node,
  onOpen,
  translate,
}: {
  node: EmpNode;
  onOpen: (id: string | number) => void;
  translate: ReturnType<typeof useTranslate>;
}) {
  const hasChildren = node.children.length > 0;
  const status = node.status ?? "active";

  return (
    <div>
      <button
        type="button"
        onClick={() => onOpen(node.id)}
        className="group flex w-fit min-w-64 items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition-colors hover:border-primary/40 hover:shadow-sm"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-500/12 text-xs font-semibold text-blue-600 dark:text-blue-400">
          {initials(node.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-primary underline-offset-2 group-hover:underline">
            {node.name || "—"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {node.job_title || "—"}
          </span>
        </span>
        <EnumBadge value={status} label={labelFor(EMPLOYEE_STATUSES, status, translate)} />
      </button>
      {hasChildren ? (
        <div className="mt-2 ml-4 flex flex-col gap-2 border-l border-border/60 pl-5">
          {node.children.map((child) => (
            <EmployeeNode
              key={String(child.id)}
              node={child}
              onOpen={onOpen}
              translate={translate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
