import { useList, useShow, useTranslate } from "@refinedev/core";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useOutlet, useParams } from "react-router";

import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import { INVOICE_STATUSES, lookup, optionLabel } from "../constants";
import { useContextualCloseTo, useOpenContextualChild } from "../route-surfaces";
import {
  DetailItems,
  DrawerSection,
  EmptyRow,
  fmtDate,
  money,
  Pill,
  SimpleTable,
  StatusTimeline,
} from "../shared";
import type { Invoice, InvoiceLineItem } from "../types";

const RESOURCE = "hub_fin_invoices";

const TIMELINE_STEPS_KEYS = [
  ["finance.invoices.timeline.draft", "Draft"],
  ["finance.invoices.timeline.sent", "Sent"],
  ["finance.invoices.timeline.paid", "Paid"],
] as const;

function isOverdue(inv: Invoice): boolean {
  if (inv.status === "paid" || inv.status === "draft") return false;
  if (inv.status === "overdue") return true;
  if (!inv.due_date) return false;
  return new Date(inv.due_date).getTime() < Date.now();
}

export function InvoiceShow() {
  const t = useTranslate();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<Invoice>({
    resource: RESOURCE,
    id,
  });

  const overdue = record ? isOverdue(record) : false;
  const statusOpt = lookup(INVOICE_STATUSES, record?.status);
  const activeIndex =
    record?.status === "paid" ? 2 : overdue || record?.status === "sent" ? 1 : 0;
  const timelineSteps = TIMELINE_STEPS_KEYS.map(([key, fallback]) =>
    t(key, fallback)
  );
  const displayName =
    record?.invoice_number ||
    t("finance.invoices.detail.unnamed", "Invoice");

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? <Skeleton className="h-6 w-40" /> : displayName
      }
      description={t(
        "finance.invoices.drawer.show.desc",
        "Line items and collection status for this invoice."
      )}
      closeLabel={t("finance.common.close", "Close")}
      closeTo={closeTo}
      nested={nested}
      actions={
        record ? (
          <EditButton
            resource={RESOURCE}
            recordItemId={record.id}
            variant="outline"
            size="icon-sm"
            onClick={() => openChild("edit")}
          >
            <Pencil />
          </EditButton>
        ) : null
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {query.isLoading ? (
          <LoadingState className="min-h-64" />
        ) : query.isError ? (
          <Alert variant="destructive">
            <AlertTitle>
              {t("finance.invoices.detail.loadError.title", "Unable to load invoice")}
            </AlertTitle>
            <AlertDescription>
              {t(
                "finance.invoices.detail.loadError.desc",
                "The invoice may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border bg-muted/20 px-4 py-4">
              <StatusTimeline
                steps={overdue ? [...timelineSteps.slice(0, 2), t("finance.invoices.timeline.overdue", "Overdue")] : timelineSteps}
                activeIndex={activeIndex}
                danger={overdue}
              />
            </div>
            <DetailItems
              title={t("finance.invoices.detail.profile", "Invoice")}
              items={[
                [t("finance.invoices.field.client", "Client"), record?.client_name || "—"],
                [
                  t("finance.invoices.field.status", "Status"),
                  <Pill key="status" option={statusOpt} label={optionLabel(statusOpt, t)} />,
                ],
                [t("finance.invoices.field.issueDate", "Issue date"), fmtDate(record?.issue_date)],
                [
                  t("finance.invoices.field.dueDate", "Due date"),
                  <span
                    key="due"
                    className={overdue ? "font-medium text-red-600 dark:text-red-400" : undefined}
                  >
                    {fmtDate(record?.due_date)}
                  </span>,
                ],
                [
                  t("finance.invoices.field.amount", "Amount"),
                  <span key="amount" className="tabular-nums">
                    {money(record?.amount, true)}
                  </span>,
                ],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <LineItemsSection invoiceId={id} total={record?.amount} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function LineItemsSection({
  invoiceId,
  total,
}: {
  invoiceId: string;
  total: number | undefined;
}) {
  const t = useTranslate();
  const openChild = useOpenContextualChild();
  const { result } = useList<InvoiceLineItem>({
    resource: "hub_fin_invoice_items",
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    sorters: [{ field: "id", order: "asc" }],
    filters: [{ field: "invoice_id", operator: "eq", value: invoiceId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });
  const items = result.data;
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <DrawerSection
      title={t("finance.invoices.items.title", "Line items")}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => openChild("items/create")}
        >
          <Plus />
          {t("finance.invoices.items.add", "Add line item")}
        </Button>
      }
    >
      <SimpleTable
        headers={[
          t("finance.invoices.items.description", "Description"),
          t("finance.invoices.items.qty", "Qty"),
          t("finance.invoices.items.unitPrice", "Unit price"),
          t("finance.invoices.items.lineTotal", "Line total"),
          t("finance.common.actions", "Actions"),
        ]}
        align={["left", "right", "right", "right", "right"]}
      >
        {items.length === 0 ? (
          <EmptyRow colSpan={5} text={t("finance.invoices.items.empty", "No line items recorded.")} />
        ) : (
          items.map((item) => (
            <tr
              key={String(item.id)}
              role="button"
              tabIndex={0}
              onClick={() => openChild(`items/edit/${encodeURIComponent(String(item.id))}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openChild(`items/edit/${encodeURIComponent(String(item.id))}`);
                }
              }}
              className="cursor-pointer"
            >
              <td className="px-3 py-2 font-medium">{item.description || "—"}</td>
              <td className="px-3 py-2 text-right tabular-nums">{item.quantity ?? 0}</td>
              <td className="px-3 py-2 text-right tabular-nums">
                {money(item.unit_price, true)}
              </td>
              <td className="px-3 py-2 text-right font-medium tabular-nums">
                {money(item.amount, true)}
              </td>
              <td className="px-3 py-2" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("finance.invoices.items.edit", "Edit line item")}
                    title={t("finance.invoices.items.edit", "Edit line item")}
                    onClick={() =>
                      openChild(`items/edit/${encodeURIComponent(String(item.id))}`)
                    }
                  >
                    <Pencil />
                  </Button>
                  <DeleteButton
                    resource="hub_fin_invoice_items"
                    recordItemId={item.id}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    aria-label={t("finance.invoices.items.delete", "Delete line item")}
                    title={t("finance.invoices.items.delete", "Delete line item")}
                  >
                    <Trash2 />
                  </DeleteButton>
                </div>
              </td>
            </tr>
          ))
        )}
      </SimpleTable>
      {items.length > 0 ? (
        <div className="flex justify-end px-1 text-xs text-muted-foreground">
          <span>
            {t("finance.invoices.items.subtotal", "Items subtotal")}:{" "}
            <span className="font-medium tabular-nums text-foreground">
              {money(subtotal, true)}
            </span>
            {typeof total === "number" && Math.abs(subtotal - total) > 0.5 ? (
              <span className="ml-1">
                ({t("finance.invoices.items.invoiceTotal", "invoice total")}{" "}
                {money(total, true)})
              </span>
            ) : null}
          </span>
        </div>
      ) : null}
    </DrawerSection>
  );
}
