import { useList, useShow, useTranslate } from "@refinedev/core";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  CATEGORIES,
  MOVE_TYPES,
  PRODUCT_STATUSES,
  formatCurrency,
  formatDateTime,
  labelFor,
  signedQty,
} from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import { DetailItems, DrawerSection, EnumBadge, useLocale } from "../shared";
import type { ProductRecord, StockMoveRecord } from "../types";

export function ProductShow() {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<ProductRecord>({
    resource: "hub_inv_products",
    id,
  });

  const displayName =
    record?.name ||
    translate("inventory.products.detail.unnamed", { ns: "starter" }, "Unnamed product");

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? <Skeleton className="h-6 w-40" /> : displayName
      }
      description={translate(
        "inventory.products.drawer.show.description",
        { ns: "starter" },
        "Catalog details and stock movement history for this product."
      )}
      closeLabel={translate("inventory.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nested}
      actions={
        record ? (
          <EditButton
            resource="hub_inv_products"
            recordItemId={record.id}
            variant="outline"
            size="icon-sm"
            aria-label={translate("inventory.products.actions.edit", { ns: "starter" }, "Edit product")}
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
              {translate("inventory.products.detail.loadError.title", { ns: "starter" }, "Unable to load product")}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "inventory.products.detail.loadError.description",
                { ns: "starter" },
                "The product may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate("inventory.products.detail.profile", { ns: "starter" }, "Profile")}
              items={[
                [translate("inventory.products.fields.sku", { ns: "starter" }, "SKU"), record?.sku || "—"],
                [
                  translate("inventory.products.fields.category", { ns: "starter" }, "Category"),
                  record?.category ? labelFor(CATEGORIES, record.category, translate) : "—",
                ],
                [
                  translate("inventory.products.fields.status", { ns: "starter" }, "Status"),
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "active"}
                    label={labelFor(PRODUCT_STATUSES, record?.status ?? "active", translate)}
                  />,
                ],
                [translate("inventory.products.fields.unitPrice", { ns: "starter" }, "Unit price"), formatCurrency(record?.unit_price, locale)],
                [translate("inventory.products.fields.reorderLevel", { ns: "starter" }, "Reorder level"), String(record?.reorder_level ?? "—")],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <StockMovesSection productId={id} locale={locale} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function StockMovesSection({
  productId,
  locale,
}: {
  productId: string;
  locale: string;
}) {
  const translate = useTranslate();
  const openChild = useOpenContextualChild();
  const { result } = useList<StockMoveRecord>({
    resource: "hub_inv_stock_moves",
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    sorters: [{ field: "moved_at", order: "desc" }],
    filters: [{ field: "product_id", operator: "eq", value: productId }],
    meta: { appends: ["warehouse"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const onHand = useMemo(
    () => result.data.reduce((sum, move) => sum + signedQty(move.type, move.qty), 0),
    [result.data]
  );

  return (
    <DrawerSection
      title={translate(
        "inventory.products.detail.stockMoves",
        { ns: "starter", qty: onHand },
        `Stock moves · ${onHand} on hand`
      )}
      action={
        <Button variant="outline" size="sm" onClick={() => openChild("moves/create")}>
          <Plus />
          {translate("inventory.products.detail.addMove", { ns: "starter" }, "Add move")}
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">{translate("inventory.stockMoves.fields.date", { ns: "starter" }, "Date")}</th>
              <th className="px-3 py-2 font-medium">{translate("inventory.stockMoves.fields.type", { ns: "starter" }, "Type")}</th>
              <th className="px-3 py-2 font-medium">{translate("inventory.stockMoves.fields.qty", { ns: "starter" }, "Qty")}</th>
              <th className="px-3 py-2 font-medium">{translate("inventory.stockMoves.fields.warehouse", { ns: "starter" }, "Warehouse")}</th>
              <th className="px-3 py-2 font-medium">{translate("inventory.common.actions", { ns: "starter" }, "Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  {translate(
                    "inventory.products.detail.noMoves",
                    { ns: "starter" },
                    "No stock moves yet. Record the first receipt or issue."
                  )}
                </td>
              </tr>
            ) : (
              result.data.map((move) => (
                <tr key={String(move.id)}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatDateTime(move.moved_at, locale)}
                  </td>
                  <td className="px-3 py-2">
                    <EnumBadge
                      value={move.type ?? "in"}
                      label={move.type ? labelFor(MOVE_TYPES, move.type, translate) : "—"}
                    />
                  </td>
                  <td className="px-3 py-2 tabular-nums font-medium">
                    {signedQty(move.type, move.qty) > 0 ? "+" : ""}
                    {signedQty(move.type, move.qty)}
                  </td>
                  <td className="px-3 py-2">{move.warehouse?.name || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={translate("inventory.stockMoves.actions.edit", { ns: "starter" }, "Edit move")}
                        onClick={() =>
                          openChild(`moves/edit/${encodeURIComponent(String(move.id))}`)
                        }
                      >
                        <Pencil />
                      </Button>
                      <DeleteButton
                        resource="hub_inv_stock_moves"
                        recordItemId={move.id}
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
        </table>
      </div>
    </DrawerSection>
  );
}
