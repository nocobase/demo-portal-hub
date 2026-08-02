import { useList, useTranslate } from "@refinedev/core";
import {
  AlertTriangle,
  DollarSign,
  Eye,
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
import { ShowButton } from "@/components/resources/buttons/show";
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
import { INVOICE_STATUSES, lookup, optionLabel } from "../constants";
import { useOpenContextualChild } from "../route-surfaces";
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
  const t = useTranslate();
  const openChild = useOpenContextualChild();
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
        title={t("finance.invoices.title", "Invoices")}
        description={t(
          "finance.invoices.subtitle",
          "Accounts receivable — issue, track and collect on client invoices."
        )}
        createResource={RESOURCE}
        createLabel={t("finance.invoices.new", "New invoice")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("finance.invoices.kpi.outstanding", "Outstanding (AR)")}
          value={money(stats.outstanding)}
          hint={t("finance.invoices.kpi.outstanding.hint", "Not yet collected")}
          icon={<Wallet className="size-4" />}
          tone="bg-blue-500/12 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label={t("finance.invoices.kpi.overdue", "Overdue")}
          value={money(stats.overdue)}
          hint={t(
            "finance.invoices.kpi.overdue.hint",
            { ns: "starter", count: stats.overdueCount },
            `${stats.overdueCount} invoice${stats.overdueCount === 1 ? "" : "s"} past due`
          )}
          icon={<AlertTriangle className="size-4" />}
          tone="bg-red-500/12 text-red-600 dark:text-red-400"
        />
        <StatCard
          label={t("finance.invoices.kpi.collected", "Collected")}
          value={money(stats.paid)}
          hint={t("finance.invoices.kpi.collected.hint", "Marked paid")}
          icon={<DollarSign className="size-4" />}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label={t("finance.invoices.kpi.total", "Total invoices")}
          value={String(stats.total)}
          hint={t("finance.invoices.kpi.total.hint", "All statuses")}
          icon={<FileClock className="size-4" />}
          tone="bg-violet-500/12 text-violet-600 dark:text-violet-400"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("finance.invoices.table.title", "All invoices")}</CardTitle>
          <CardDescription>
            {t(
              "finance.invoices.table.desc",
              "Overdue rows are highlighted. Newest issued first."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("finance.invoices.col.number", "Invoice #")}</TableHead>
                  <TableHead>{t("finance.invoices.col.client", "Client")}</TableHead>
                  <TableHead className="text-right">{t("finance.invoices.col.amount", "Amount")}</TableHead>
                  <TableHead>{t("finance.invoices.col.issued", "Issued")}</TableHead>
                  <TableHead>{t("finance.invoices.col.due", "Due")}</TableHead>
                  <TableHead>{t("finance.invoices.col.status", "Status")}</TableHead>
                  <TableHead className="w-[136px] text-right">{t("finance.common.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      {t("finance.invoices.loading", "Loading invoices…")}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      {t("finance.invoices.empty", "No invoices yet.")}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((inv) => {
                    const overdue = isOverdue(inv);
                    return (
                      <TableRow
                        key={inv.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openChild(`show/${inv.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openChild(`show/${inv.id}`);
                          }
                        }}
                        className={cn(
                          "cursor-pointer",
                          overdue && "bg-red-500/[0.06] hover:bg-red-500/[0.09]"
                        )}
                      >
                        <TableCell className="font-medium tabular-nums text-primary underline-offset-2 hover:underline">
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
                          {(() => {
                            const opt = lookup(INVOICE_STATUSES, inv.status);
                            return <Pill option={opt} label={optionLabel(opt, t)} />;
                          })()}
                        </TableCell>
                        <TableCell onClick={(event) => event.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <ShowButton
                              resource={RESOURCE}
                              recordItemId={inv.id}
                              variant="ghost"
                              size="icon"
                              aria-label={t("finance.invoices.view", "View invoice")}
                              title={t("finance.invoices.view", "View invoice")}
                              onClick={() => openChild(`show/${inv.id}`)}
                            >
                              <Eye />
                            </ShowButton>
                            <EditButton
                              resource={RESOURCE}
                              recordItemId={inv.id}
                              variant="ghost"
                              size="icon"
                              aria-label={t("finance.invoices.edit", "Edit invoice")}
                              title={t("finance.invoices.edit", "Edit invoice")}
                              onClick={() => openChild(`edit/${inv.id}`)}
                            >
                              <Pencil />
                            </EditButton>
                            <DeleteButton
                              resource={RESOURCE}
                              recordItemId={inv.id}
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              aria-label={t("finance.invoices.delete", "Delete invoice")}
                              title={t("finance.invoices.delete", "Delete invoice")}
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
