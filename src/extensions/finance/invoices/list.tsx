import { useList } from "@refinedev/core";
import {
  AlertTriangle,
  DollarSign,
  FileClock,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { Outlet } from "react-router";

import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { INVOICE_STATUSES, lookup } from "../constants";
import { fmtDate, money, PageHeader, Pill, StatCard } from "../shared";
import type { Invoice } from "../types";

const RESOURCE = "hub_fin_invoices";

function isOverdue(inv: Invoice): boolean {
  if (inv.status === "paid" || inv.status === "draft") return false;
  if (inv.status === "overdue") return true;
  if (!inv.due_date) return false;
  return new Date(inv.due_date).getTime() < Date.now();
}

export function InvoiceListPage() {
  return (
    <>
      <CanAccess resource={RESOURCE} action="list" fallback={<AccessDenied />}>
        <InvoiceList />
      </CanAccess>
      <Outlet />
    </>
  );
}

function InvoiceList() {
  const { result, query } = useList<Invoice>({
    resource: RESOURCE,
    pagination: { mode: "off" },
    sorters: [{ field: "issue_date", order: "desc" }],
  });
  const rows = result?.data ?? [];

  const stats = useMemo(() => {
    let outstanding = 0;
    let overdue = 0;
    let paid = 0;
    let overdueCount = 0;
    for (const inv of rows) {
      const amt = Number(inv.amount) || 0;
      if (inv.status === "paid") paid += amt;
      else outstanding += amt;
      if (isOverdue(inv)) {
        overdue += amt;
        overdueCount += 1;
      }
    }
    return { outstanding, overdue, paid, overdueCount, total: rows.length };
  }, [rows]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Accounts receivable — issue, track and collect on client invoices."
        createResource={RESOURCE}
        createLabel="New invoice"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding (AR)"
          value={money(stats.outstanding)}
          hint="Not yet collected"
          icon={<Wallet className="size-4" />}
          tone="bg-blue-500/12 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Overdue"
          value={money(stats.overdue)}
          hint={`${stats.overdueCount} invoice${stats.overdueCount === 1 ? "" : "s"} past due`}
          icon={<AlertTriangle className="size-4" />}
          tone="bg-red-500/12 text-red-600 dark:text-red-400"
        />
        <StatCard
          label="Collected"
          value={money(stats.paid)}
          hint="Marked paid"
          icon={<DollarSign className="size-4" />}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Total invoices"
          value={String(stats.total)}
          hint="All statuses"
          icon={<FileClock className="size-4" />}
          tone="bg-violet-500/12 text-violet-600 dark:text-violet-400"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All invoices</CardTitle>
          <CardDescription>
            Overdue rows are highlighted. Newest issued first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[104px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Loading invoices…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No invoices yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((inv) => {
                    const overdue = isOverdue(inv);
                    return (
                      <TableRow
                        key={inv.id}
                        className={cn(overdue && "bg-red-500/[0.06] hover:bg-red-500/[0.09]")}
                      >
                        <TableCell className="font-medium tabular-nums">
                          {inv.invoice_number}
                        </TableCell>
                        <TableCell>{inv.client_name || "—"}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {money(inv.amount, true)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {fmtDate(inv.issue_date)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "tabular-nums",
                            overdue
                              ? "font-medium text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                          )}
                        >
                          {fmtDate(inv.due_date)}
                        </TableCell>
                        <TableCell>
                          <Pill option={lookup(INVOICE_STATUSES, inv.status)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <EditButton
                              resource={RESOURCE}
                              recordItemId={inv.id}
                              variant="ghost"
                              size="icon"
                              aria-label="Edit invoice"
                              title="Edit invoice"
                            >
                              <Pencil />
                            </EditButton>
                            <DeleteButton
                              resource={RESOURCE}
                              recordItemId={inv.id}
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              aria-label="Delete invoice"
                              title="Delete invoice"
                            >
                              <Trash2 />
                            </DeleteButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
