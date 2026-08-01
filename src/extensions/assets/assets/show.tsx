import { useList, useShow, useUpdate } from "@refinedev/core";
import { Pencil, Plus, Undo2 } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  assigneeName,
  categoryBadgeClass,
  formatCurrency,
  formatDate,
  labelFor,
  statusBadgeClass,
  todayIso,
} from "../constants";
import { assetsRoutes } from "../routes";
import {
  DetailItems,
  DrawerSection,
  EmptyRow,
  Pill,
  SimpleTable,
  useLocale,
} from "../shared";
import type { AssetRecord, AssignmentRecord } from "../types";
import { useOpenChild } from "../navigation";

export function AssetShow() {
  const locale = useLocale();
  const openChild = useOpenChild();
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<AssetRecord>({
    resource: "hub_as_assets",
    id,
  });

  const displayName = record?.name || record?.tag || "Asset";

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          displayName
        )
      }
      description="Profile and full assignment history for this device."
      closeLabel="Close"
      closeTo={assetsRoutes.assets}
      nested={nested}
      actions={
        record ? (
          <EditButton
            resource="hub_as_assets"
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
            <AlertTitle>Unable to load asset</AlertTitle>
            <AlertDescription>
              The asset may no longer exist, or you may not have permission to
              view it.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title="Profile"
              items={[
                [
                  "Tag",
                  <span key="tag" className="font-mono text-xs">
                    {record?.tag || "—"}
                  </span>,
                ],
                [
                  "Category",
                  record?.category ? (
                    <Pill
                      key="cat"
                      label={labelFor(ASSET_CATEGORIES, record.category)}
                      className={categoryBadgeClass(record.category)}
                    />
                  ) : (
                    "—"
                  ),
                ],
                [
                  "Status",
                  <Pill
                    key="status"
                    label={labelFor(ASSET_STATUSES, record?.status ?? "in_stock")}
                    className={statusBadgeClass(record?.status ?? "in_stock")}
                  />,
                ],
                ["Value", formatCurrency(record?.value, locale)],
                ["Purchase date", formatDate(record?.purchase_date, locale)],
                ["Added", formatDate(record?.createdAt, locale)],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <AssignmentHistory
                  assetId={id}
                  assetStatus={record?.status ?? "in_stock"}
                  locale={locale}
                />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function AssignmentHistory({
  assetId,
  assetStatus,
  locale,
}: {
  assetId: string;
  assetStatus: string;
  locale: string;
}) {
  const openChild = useOpenChild();
  const { mutate: updateAssignment } = useUpdate<AssignmentRecord>();
  const { mutate: updateAsset } = useUpdate<AssetRecord>();
  const { result } = useList<AssignmentRecord>({
    resource: "hub_as_assignments",
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    sorters: [{ field: "assigned_date", order: "desc" }],
    filters: [{ field: "asset_id", operator: "eq", value: assetId }],
    meta: { appends: ["assignee"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const hasActive = result.data.some((row) => !row.returned_date);

  const returnAssignment = (assignment: AssignmentRecord) => {
    updateAssignment(
      {
        resource: "hub_as_assignments",
        id: assignment.id,
        values: { returned_date: todayIso() },
      },
      {
        onSuccess: () => {
          // Returning the active device puts it back in stock.
          if (assetStatus === "assigned") {
            updateAsset({
              resource: "hub_as_assets",
              id: assetId,
              values: { status: "in_stock" },
            });
          }
        },
      }
    );
  };

  return (
    <DrawerSection
      title="Assignment history"
      action={
        <Button
          variant="outline"
          size="sm"
          disabled={hasActive}
          title={
            hasActive
              ? "Return the active assignment before reassigning"
              : "Assign this device"
          }
          onClick={() => openChild("assign")}
        >
          <Plus />
          Assign
        </Button>
      }
    >
      <SimpleTable
        headers={["Assignee", "Assigned", "Returned", "Note", "Actions"]}
      >
        {result.data.length === 0 ? (
          <EmptyRow
            colSpan={5}
            text="Never assigned. Use Assign to hand this device to someone."
          />
        ) : (
          result.data.map((assignment) => {
            const active = !assignment.returned_date;
            return (
              <tr key={String(assignment.id)}>
                <td className="px-3 py-2 font-medium">
                  {assigneeName(assignment.assignee)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDate(assignment.assigned_date, locale)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {active ? (
                    <Pill
                      label="Active"
                      className="bg-blue-500/15 text-blue-700 dark:text-blue-300"
                    />
                  ) : (
                    formatDate(assignment.returned_date, locale)
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {assignment.note || "—"}
                </td>
                <td className="px-3 py-2">
                  {active ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => returnAssignment(assignment)}
                    >
                      <Undo2 />
                      Return
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </SimpleTable>
    </DrawerSection>
  );
}
