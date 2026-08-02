import { useTranslate } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableFilterDropdownText } from "@/components/data-table/data-table-filter";
import { DataTableSorter } from "@/components/data-table/data-table-sorter";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { ShowButton } from "@/components/resources/buttons/show";
import { ListView } from "@/components/resources/views/list-view";
import { useOpenContextualChild } from "../route-surfaces";
import type { ContactRecord } from "../types";

export function ContactsLayout() {
  return (
    <CanAccess
      resource="hub_sales_contacts"
      action="list"
      fallback={<AccessDenied />}
    >
      <ContactList />
    </CanAccess>
  );
}

function ContactList() {
  const translate = useTranslate();
  const openChild = useOpenContextualChild();

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<ContactRecord>();
    return [
      columnHelper.accessor("name", {
        id: "name",
        header: ({ column, table }) => (
          <div className="flex items-center gap-1">
            <span>
              {translate("sales.contacts.fields.name", { ns: "starter" }, "Name")}
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
        cell: ({ getValue, row }) => (
          <button
            type="button"
            className="font-medium text-left text-primary underline-offset-2 hover:underline"
            onClick={() => openChild(`show/${row.original.id}`)}
          >
            {getValue() || "—"}
          </button>
        ),
      }),
      columnHelper.accessor("title", {
        id: "title",
        header: translate(
          "sales.contacts.fields.jobTitle",
          { ns: "starter" },
          "Job title"
        ),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: translate("sales.contacts.fields.email", { ns: "starter" }, "Email"),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <a
              href={`mailto:${value}`}
              className="text-primary underline-offset-2 hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {value}
            </a>
          ) : (
            "—"
          );
        },
      }),
      columnHelper.accessor("phone", {
        id: "phone",
        header: translate("sales.contacts.fields.phone", { ns: "starter" }, "Phone"),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "—",
      }),
      columnHelper.accessor((record) => record.account, {
        id: "account",
        header: translate(
          "sales.contacts.fields.account",
          { ns: "starter" },
          "Account"
        ),
        enableSorting: false,
        cell: ({ getValue, row }) => {
          const account = getValue();
          if (!account?.name) return "—";
          return (
            <button
              type="button"
              className="text-left text-primary underline-offset-2 hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                openChild(`show/${row.original.id}`);
              }}
            >
              {account.name}
            </button>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: translate("sales.common.actions", { ns: "starter" }, "Actions"),
        enableSorting: false,
        size: 144,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ShowButton
              resource="hub_sales_contacts"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`show/${row.original.id}`)}
            >
              <Eye />
            </ShowButton>
            <EditButton
              resource="hub_sales_contacts"
              recordItemId={row.original.id}
              variant="ghost"
              size="icon"
              onClick={() => openChild(`edit/${row.original.id}`)}
            >
              <Pencil />
            </EditButton>
            <DeleteButton
              resource="hub_sales_contacts"
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
  }, [openChild, translate]);

  const table = useTable<ContactRecord>({
    columns,
    refineCoreProps: {
      resource: "hub_sales_contacts",
      syncWithLocation: false,
      meta: { appends: ["account"] },
      sorters: { initial: [{ field: "name", order: "asc" }] },
    },
  });

  return (
    <ListView resource="hub_sales_contacts">
      <DataTable table={table} />
    </ListView>
  );
}
