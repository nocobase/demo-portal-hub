import { useList, useShow } from "@refinedev/core";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  formatCurrency,
  formatDate,
  lineTotal,
  statusLabel,
} from "../constants";
import { procurementRoutes } from "../routes";
import { useOpenContextualChild } from "../route-surfaces";
import { DetailItems, DrawerSection, EnumBadge, useLocale } from "../shared";
import type { PoItemRecord, PurchaseOrderRecord } from "../types";

export function PurchaseOrderShow() {
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<PurchaseOrderRecord>({
    resource: "hub_po_purchase_orders",
    id,
    meta: { appends: ["supplier", "owner"] },
  });

  const displayName = record?.po_number || "Purchase order";

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          displayName
        )
      }
      description="Supplier, ownership and line items for this order."
      closeLabel="Close"
      closeTo={procurementRoutes.purchaseOrders}
      nested={nested}
      actions={
        record ? (
          <EditButton
            resource="hub_po_purchase_orders"
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
            <AlertTitle>Unable to load purchase order</AlertTitle>
            <AlertDescription>
              The order may no longer exist, or you may not have permission to
              view it.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title="Order"
              items={[
                ["Supplier", record?.supplier?.name || "—"],
                [
                  "Owner",
                  record?.owner?.nickname || record?.owner?.username || "—",
                ],
                [
                  "Status",
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "draft"}
                    label={statusLabel(record?.status ?? "draft")}
                  />,
                ],
                ["Order date", formatDate(record?.order_date, locale)],
                [
                  "Order total",
                  <span key="total" className="tabular-nums">
                    {formatCurrency(record?.total, locale)}
                  </span>,
                ],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <ItemsSection purchaseOrderId={id} locale={locale} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function ItemsSection({
  purchaseOrderId,
  locale,
}: {
  purchaseOrderId: string;
  locale: string;
}) {
  const openChild = useOpenContextualChild();
  const { result } = useList<PoItemRecord>({
    resource: "hub_po_items",
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    sorters: [{ field: "id", order: "asc" }],
    filters: [
      { field: "purchase_order_id", operator: "eq", value: purchaseOrderId },
    ],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const items = result.data;
  const subtotal = items.reduce(
    (sum, item) => sum + lineTotal(item.qty, item.unit_price),
    0
  );

  return (
    <DrawerSection
      title="Line items"
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => openChild("items/create")}
        >
          <Plus />
          Add item
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 text-right font-medium">Qty</th>
              <th className="px-3 py-2 text-right font-medium">Unit price</th>
              <th className="px-3 py-2 text-right font-medium">Line total</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  No line items yet. Add the products on this order.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={String(item.id)}>
                  <td className="px-3 py-2 font-medium">
                    {item.product_name || "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {item.qty ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(item.unit_price, locale)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">
                    {formatCurrency(lineTotal(item.qty, item.unit_price), locale)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          openChild(
                            `items/edit/${encodeURIComponent(String(item.id))}`
                          )
                        }
                      >
                        <Pencil />
                      </Button>
                      <DeleteButton
                        resource="hub_po_items"
                        recordItemId={item.id}
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 />
                      </DeleteButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {items.length > 0 ? (
            <tfoot>
              <tr className="border-t bg-muted/20">
                <td
                  colSpan={3}
                  className="px-3 py-2 text-right text-xs font-medium text-muted-foreground"
                >
                  Items subtotal
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">
                  {formatCurrency(subtotal, locale)}
                </td>
                <td />
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </DrawerSection>
  );
}
