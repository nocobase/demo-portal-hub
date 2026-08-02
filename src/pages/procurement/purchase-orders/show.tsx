import { useList, useShow, useTranslate } from "@refinedev/core";
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
  PO_STATUSES,
  formatCurrency,
  formatDate,
  labelFor,
  lineTotal,
} from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import { DetailItems, DrawerSection, EnumBadge, useLocale } from "../shared";
import type { PoItemRecord, PurchaseOrderRecord } from "../types";

export function PurchaseOrderShow({
  idParam = "id",
}: { idParam?: string } = {}) {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const params = useParams<Record<string, string>>();
  const id = params[idParam];
  const nested = useOutlet();
  const { result: record, query } = useShow<PurchaseOrderRecord>({
    resource: "hub_po_purchase_orders",
    id,
    meta: { appends: ["supplier", "owner"] },
  });

  const displayName =
    record?.po_number ||
    translate("procurement.po.detail.fallbackName", { ns: "starter" }, "Purchase order");

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          displayName
        )
      }
      description={translate(
        "procurement.po.drawer.show.description",
        { ns: "starter" },
        "Supplier, ownership and line items for this order."
      )}
      closeLabel={translate("procurement.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
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
            <AlertTitle>
              {translate(
                "procurement.po.detail.loadError.title",
                { ns: "starter" },
                "Unable to load purchase order"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "procurement.po.detail.loadError.description",
                { ns: "starter" },
                "The order may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate("procurement.po.detail.title", { ns: "starter" }, "Order")}
              items={[
                [
                  translate("procurement.po.fields.supplier", { ns: "starter" }, "Supplier"),
                  record?.supplier?.name || "—",
                ],
                [
                  translate("procurement.po.fields.owner", { ns: "starter" }, "Owner"),
                  record?.owner?.nickname || record?.owner?.username || "—",
                ],
                [
                  translate("procurement.po.fields.status", { ns: "starter" }, "Status"),
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "draft"}
                    label={labelFor(PO_STATUSES, record?.status ?? "draft", translate)}
                  />,
                ],
                [
                  translate("procurement.po.fields.orderDate", { ns: "starter" }, "Order date"),
                  formatDate(record?.order_date, locale),
                ],
                [
                  translate("procurement.po.fields.orderTotal", { ns: "starter" }, "Order total"),
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
  const translate = useTranslate();
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
      title={translate("procurement.po.items.title", { ns: "starter" }, "Line items")}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => openChild("items/create")}
        >
          <Plus />
          {translate("procurement.po.items.add", { ns: "starter" }, "Add item")}
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">
                {translate("procurement.po.items.product", { ns: "starter" }, "Product")}
              </th>
              <th className="px-3 py-2 text-right font-medium">
                {translate("procurement.po.items.qty", { ns: "starter" }, "Qty")}
              </th>
              <th className="px-3 py-2 text-right font-medium">
                {translate("procurement.po.items.unitPrice", { ns: "starter" }, "Unit price")}
              </th>
              <th className="px-3 py-2 text-right font-medium">
                {translate("procurement.po.items.lineTotal", { ns: "starter" }, "Line total")}
              </th>
              <th className="px-3 py-2 font-medium">
                {translate("procurement.common.actions", { ns: "starter" }, "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  {translate(
                    "procurement.po.items.empty",
                    { ns: "starter" },
                    "No line items yet. Add the products on this order."
                  )}
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
                  {translate(
                    "procurement.po.items.subtotal",
                    { ns: "starter" },
                    "Items subtotal"
                  )}
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
