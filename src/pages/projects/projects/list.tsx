import { useTranslate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { DataTable } from "@/components/data-table/data-table";
import {
  DataTableFilterCombobox,
  DataTableFilterDropdownText,
} from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ShowButton } from "@/components/resources/buttons/show";
import { ListView } from "@/components/resources/views/list-view";
import { PROJECT_STATUSES, formatDate, labelFor, userLabel } from "../constants";
import { useOpenContextualChild } from "../route-surfaces";
import { EnumBadge, useLocale } from "../shared";
import type { ProjectRecord } from "../types";
import { ProjectStats } from "./stats";
import { ProjectTimeline } from "./timeline";

export function ProjectsLayout() {
  return (
    <CanAccess
      resource="hub_pj_projects"
      action="list"
      fallback={<AccessDenied />}
    >
      <ProjectList />
    </CanAccess>
  );
}

function ProjectList() {
  const locale = useLocale();
  const translate = useTranslate();
  const openChild = useOpenContextualChild();

  const statusOptions = useMemo(
    () =>
      PROJECT_STATUSES.map((s) => ({
        value: s.value,
        label: translate(s.i18nKey, { ns: "starter" }, s.label),
      })),
    [translate]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<ProjectRecord>();
    return [
      columnHelper.accessor("name", {
        id: "name",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>
              {translate("projects.projects.columns.project", { ns: "starter" }, "Project")}
            </span>
            <DataTableSorter column={column} />
            <DataTableFilterDropdownText
              column={column}
              table={table}
              defaultOperator="contains"
              operators={["contains", "eq", "startswith"]}
            />
          </div>
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => openChild(`show/${row.original.id}`)}
            className="flex flex-col text-left"
          >
            <span className="font-medium underline-offset-2 hover:underline">
              {row.original.name || "—"}
            </span>
            {row.original.code ? (
              <span className="text-xs text-muted-foreground">
                {row.original.code}
              </span>
            ) : null}
          </button>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>
              {translate("projects.projects.columns.status", { ns: "starter" }, "Status")}
            </span>
            <DataTableFilterCombobox
              column={column}
              table={table}
              options={statusOptions}
              defaultOperator="eq"
              operators={["eq", "in"]}
            />
          </div>
        ),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue() ?? "planning";
          return (
            <EnumBadge
              value={value}
              label={labelFor(PROJECT_STATUSES, value, translate)}
            />
          );
        },
      }),
      columnHelper.accessor("owner", {
        id: "owner",
        header: translate("projects.projects.columns.owner", { ns: "starter" }, "Owner"),
        enableSorting: false,
        cell: ({ getValue }) => userLabel(getValue()),
      }),
      columnHelper.accessor("due_date", {
        id: "due_date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>
              {translate("projects.projects.columns.due", { ns: "starter" }, "Due")}
            </span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ getValue }) => formatDate(getValue(), locale),
      }),
      columnHelper.display({
        id: "actions",
        header: translate("projects.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 144,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShowButton
              resource="hub_pj_projects"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`show/${row.original.id}`)}
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_pj_projects"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_pj_projects"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
            </DeleteButton>
          </div>
        ),
      }),
    ];
  }, [locale, openChild, statusOptions, translate]);

  const table = useTable<ProjectRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_pj_projects",
      syncWithLocation: false,
      meta: { appends: ["owner"] },
      sorters: { initial: [{ field: "due_date", order: "asc" }] },
    },
  });

  return (
    <ListView resource="hub_pj_projects">
      <ProjectStats />
      <ProjectTimeline />
      <DataTable table={table} />
    </ListView>
  );
}
