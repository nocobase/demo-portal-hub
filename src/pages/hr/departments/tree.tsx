import { useList, useTranslate } from "@refinedev/core";
import { Building2, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { LoadingState } from "@/components/app-shell/loading-state";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { hrRoutes } from "../routes";
import type { DepartmentRecord, EmployeeRecord } from "../types";

type TreeNode = DepartmentRecord & { children: TreeNode[]; depth: number };

export function DepartmentsLayout() {
  return (
    <CanAccess
      resource="hub_hr_departments"
      action="list"
      fallback={<AccessDenied />}
    >
      <DepartmentTree />
    </CanAccess>
  );
}

function DepartmentTree() {
  const translate = useTranslate();
  const navigate = useNavigate();

  const { result: deptResult, query: deptQuery } = useList<DepartmentRecord>({
    resource: "hub_hr_departments",
    pagination: { mode: "server", currentPage: 1, pageSize: 300 },
    sorters: [{ field: "name", order: "asc" }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const { result: empResult } = useList<EmployeeRecord>({
    resource: "hub_hr_employees",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const headcountByDept = useMemo(() => {
    const map = new Map<string, number>();
    for (const emp of empResult.data) {
      if (emp.status === "terminated") continue;
      const key = emp.department_id != null ? String(emp.department_id) : "";
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [empResult.data]);

  const roots = useMemo(
    () => buildTree(deptResult.data),
    [deptResult.data]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">
              {translate("hr.departments.title", { ns: "starter" }, "Departments")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {translate(
                "hr.departments.subtitle",
                { ns: "starter" },
                "The org structure — teams nested under their parent, with current headcount."
              )}
            </p>
          </div>
          <Button onClick={() => navigate(hrRoutes.departmentsCreate)}>
            <Plus />
            {translate("hr.departments.actions.add", { ns: "starter" }, "Add department")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-2 sm:p-3">
          {deptQuery.isLoading ? (
            <LoadingState className="min-h-48" />
          ) : roots.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {translate(
                "hr.departments.empty",
                { ns: "starter" },
                "No departments yet. Add your first team to start the org chart."
              )}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {roots.map((node) => (
                <TreeRow
                  key={String(node.id)}
                  node={node}
                  headcountByDept={headcountByDept}
                  onEdit={(id) => navigate(`/departments/edit/${id}`)}
                  onShow={(id) => navigate(`/departments/show/${id}`)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TreeRow({
  node,
  headcountByDept,
  onEdit,
  onShow,
}: {
  node: TreeNode;
  headcountByDept: Map<string, number>;
  onEdit: (id: string | number) => void;
  onShow: (id: string | number) => void;
}) {
  const translate = useTranslate();
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const headcount = headcountByDept.get(String(node.id)) ?? 0;

  return (
    <li>
      <div
        className="group flex items-center gap-2 rounded-lg py-2 pr-2 hover:bg-accent/60"
        style={{ paddingLeft: node.depth * 20 + 4 }}
      >
        <button
          type="button"
          onClick={() => hasChildren && setOpen((prev) => !prev)}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground",
            hasChildren ? "hover:bg-accent" : "opacity-0"
          )}
          aria-label={
            open
              ? translate("hr.departments.tree.collapse", { ns: "starter" }, "Collapse")
              : translate("hr.departments.tree.expand", { ns: "starter" }, "Expand")
          }
        >
          <ChevronRight
            className={cn(
              "size-4 transition-transform",
              open && hasChildren && "rotate-90"
            )}
          />
        </button>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/12 text-blue-600 dark:text-blue-400">
          <Building2 className="size-4" />
        </span>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => onShow(node.id)}
        >
          <span className="truncate text-sm font-medium text-primary underline-offset-2 hover:underline">
            {node.name}
          </span>
          {node.code ? (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {node.code}
            </span>
          ) : null}
        </button>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {headcount}{" "}
          {headcount === 1
            ? translate("hr.departments.tree.person", { ns: "starter" }, "person")
            : translate("hr.departments.tree.people", { ns: "starter" }, "people")}
        </span>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            title={translate("hr.common.edit", { ns: "starter" }, "Edit")}
            onClick={() => onEdit(node.id)}
          >
            <Pencil />
          </Button>
          <DeleteButton
            resource="hub_hr_departments"
            recordItemId={node.id}
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
          </DeleteButton>
        </div>
      </div>
      {hasChildren && open ? (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <TreeRow
              key={String(child.id)}
              node={child}
              headcountByDept={headcountByDept}
              onEdit={onEdit}
              onShow={onShow}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function buildTree(rows: DepartmentRecord[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  for (const row of rows) {
    byId.set(String(row.id), { ...row, children: [], depth: 0 });
  }
  const roots: TreeNode[] = [];
  for (const node of byId.values()) {
    const parentId = node.parentId != null ? String(node.parentId) : null;
    const parent = parentId ? byId.get(parentId) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const assignDepth = (nodes: TreeNode[], depth: number) => {
    for (const node of nodes) {
      node.depth = depth;
      node.children.sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "")
      );
      assignDepth(node.children, depth + 1);
    }
  };
  roots.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  assignDepth(roots, 0);
  return roots;
}
