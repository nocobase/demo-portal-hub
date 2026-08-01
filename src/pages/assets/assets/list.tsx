import { useList, useTranslate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
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
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  categoryBadgeClass,
  formatCurrency,
  formatDate,
  labelFor,
  statusBadgeClass,
} from "../constants";
import { Pill, useLocale } from "../shared";
import type { AssetRecord } from "../types";
import { useOpenContextualChild } from "../route-surfaces";
import { AssetsKpi } from "./kpi";

export function AssetList() {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();

  // Full set (unpaginated) powers the KPI tiles + charts above the table.
  const { result: allAssets } = useList<AssetRecord>({
    resource: "hub_as_assets",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const categoryOptions = useMemo(
    () =>
      ASSET_CATEGORIES.map((c) => ({
        value: c.value,
        label: labelFor(ASSET_CATEGORIES, c.value, translate),
      })),
    [translate]
  );
  const statusOptions = useMemo(
    () =>
      ASSET_STATUSES.map((s) => ({
        value: s.value,
        label: labelFor(ASSET_STATUSES, s.value, translate),
      })),
    [translate]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<AssetRecord>();
    return [
      columnHelper.accessor("tag", {
        id: "tag",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("assets.assets.fields.tag", { ns: "starter" }, "Tag")}</span>
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
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {getValue() || "—"}
          </span>
        ),
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("assets.assets.fields.name", { ns: "starter" }, "Name")}</span>
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
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() || "—"}</span>
        ),
      }),
      columnHelper.accessor("category", {
        id: "category",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("assets.assets.fields.category", { ns: "starter" }, "Category")}</span>
            <DataTableFilterCombobox
              column={column}
              table={table}
              options={categoryOptions}
              defaultOperator="eq"
              operators={["eq", "in"]}
            />
          </div>
        ),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <Pill
              label={labelFor(ASSET_CATEGORIES, value, translate)}
              className={categoryBadgeClass(value)}
            />
          ) : (
            "—"
          );
        },
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>{translate("assets.assets.fields.status", { ns: "starter" }, "Status")}</span>
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
          const value = getValue() ?? "in_stock";
          return (
            <Pill
              label={labelFor(ASSET_STATUSES, value, translate)}
              className={statusBadgeClass(value)}
            />
          );
        },
      }),
      columnHelper.accessor("value", {
        id: "value",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>{translate("assets.assets.fields.value", { ns: "starter" }, "Value")}</span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="tabular-nums">{formatCurrency(getValue(), locale)}</span>
        ),
      }),
      columnHelper.accessor("purchase_date", {
        id: "purchase_date",
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span>{translate("assets.assets.fields.purchased", { ns: "starter" }, "Purchased")}</span>
            <DataTableSorter column={column} />
          </div>
        ),
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{formatDate(getValue(), locale)}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: translate("assets.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 144,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShowButton
              resource="hub_as_assets"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`show/${row.original.id}`)}
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_as_assets"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_as_assets"
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
  }, [categoryOptions, locale, openChild, statusOptions, translate]);

  const table = useTable<AssetRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_as_assets",
      syncWithLocation: false,
      sorters: { initial: [{ field: "tag", order: "asc" }] },
    },
  });

  return (
    <ListView resource="hub_as_assets">
      <AssetsKpi assets={allAssets.data} locale={locale} />
      <DataTable table={table} />
    </ListView>
  );
}
