import { useList, useShow } from "@refinedev/core";
import { Pencil } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EditButton } from "@/components/resources/buttons/edit";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  SUPPLIER_STATUSES,
  formatCurrency,
  formatDate,
  labelFor,
  statusLabel,
} from "../constants";
import { procurementRoutes } from "../routes";
import { useOpenContextualChild } from "../route-surfaces";
import { DetailItems, DrawerSection, EnumBadge, RatingStars, useLocale } from "../shared";
import type { PurchaseOrderRecord, SupplierRecord } from "../types";

export function SupplierShow() {
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<SupplierRecord>({
    resource: "hub_po_suppliers",
    id,
  });

  const displayName = record?.name || "Unnamed supplier";

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          displayName
        )
      }
      description="Profile and purchase orders for this vendor."
      closeLabel="Close"
      closeTo={procurementRoutes.suppliers}
      nested={nested}
      actions={
        record ? (
          <EditButton
            resource="hub_po_suppliers"
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
            <AlertTitle>Unable to load supplier</AlertTitle>
            <AlertDescription>
              The supplier may no longer exist, or you may not have permission
              to view it.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title="Profile"
              items={[
                ["Contact", record?.contact_name || "—"],
                [
                  "Email",
                  record?.email ? (
                    <a
                      key="email"
                      href={`mailto:${record.email}`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {record.email}
                    </a>
                  ) : (
                    "—"
                  ),
                ],
                ["Rating", <RatingStars key="rating" value={record?.rating} />],
                [
                  "Status",
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "active"}
                    label={labelFor(SUPPLIER_STATUSES, record?.status ?? "active")}
                  />,
                ],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <SupplierOrdersSection supplierId={id} locale={locale} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function SupplierOrdersSection({
  supplierId,
  locale,
}: {
  supplierId: string;
  locale: string;
}) {
  const { result } = useList<PurchaseOrderRecord>({
    resource: "hub_po_purchase_orders",
    pagination: { mode: "server", currentPage: 1, pageSize: 50 },
    sorters: [{ field: "order_date", order: "desc" }],
    filters: [{ field: "supplier_id", operator: "eq", value: supplierId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const orders = result.data;
  const spend = orders
    .filter((po) => po.status !== "cancelled")
    .reduce((sum, po) => sum + Number(po.total ?? 0), 0);

  return (
    <DrawerSection
      title="Purchase orders"
      action={
        <span className="text-xs text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"} ·{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(spend, locale)}
          </span>{" "}
          committed
        </span>
      }
    >
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">PO number</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Order date</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  No purchase orders raised for this supplier yet.
                </td>
              </tr>
            ) : (
              orders.map((po) => (
                <tr key={String(po.id)}>
                  <td className="px-3 py-2 font-medium">{po.po_number || "—"}</td>
                  <td className="px-3 py-2">
                    <EnumBadge value={po.status} label={statusLabel(po.status)} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatDate(po.order_date, locale)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(po.total, locale)}
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
