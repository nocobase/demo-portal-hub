import { useList, useShow, useTranslate, useUpdate } from "@refinedev/core";
import { Eye, Pencil, Plus, Undo2 } from "lucide-react";
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
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import {
  DetailItems,
  DrawerSection,
  EmptyRow,
  Pill,
  SimpleTable,
  useLocale,
} from "../shared";
import type { AssetRecord, AssignmentRecord } from "../types";

export function AssetShow() {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nested = useOutlet();
  const { result: record, query } = useShow<AssetRecord>({
    resource: "hub_as_assets",
    id,
  });

  const displayName =
    record?.name ||
    record?.tag ||
    translate("assets.assets.detail.unnamed", { ns: "starter" }, "Asset");

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
        "assets.assets.drawer.show.description",
        { ns: "starter" },
        "Profile and full assignment history for this device."
      )}
      closeLabel={translate("assets.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
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
            <AlertTitle>
              {translate(
                "assets.assets.detail.loadError.title",
                { ns: "starter" },
                "Unable to load asset"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "assets.assets.detail.loadError.description",
                { ns: "starter" },
                "The asset may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate("assets.assets.detail.profile", { ns: "starter" }, "Profile")}
              items={[
                [
                  translate("assets.assets.fields.tag", { ns: "starter" }, "Tag"),
                  <span key="tag" className="font-mono text-xs">
                    {record?.tag || "—"}
                  </span>,
                ],
                [
                  translate("assets.assets.fields.category", { ns: "starter" }, "Category"),
                  record?.category ? (
                    <Pill
                      key="cat"
                      label={labelFor(ASSET_CATEGORIES, record.category, translate)}
                      className={categoryBadgeClass(record.category)}
                    />
                  ) : (
                    "—"
                  ),
                ],
                [
                  translate("assets.assets.fields.status", { ns: "starter" }, "Status"),
                  <Pill
                    key="status"
                    label={labelFor(ASSET_STATUSES, record?.status ?? "in_stock", translate)}
                    className={statusBadgeClass(record?.status ?? "in_stock")}
                  />,
                ],
                [
                  translate("assets.assets.fields.value", { ns: "starter" }, "Value"),
                  formatCurrency(record?.value, locale),
                ],
                [
                  translate("assets.assets.fields.purchaseDate", { ns: "starter" }, "Purchase date"),
                  formatDate(record?.purchase_date, locale),
                ],
                [
                  translate("assets.assets.detail.added", { ns: "starter" }, "Added"),
                  formatDate(record?.createdAt, locale),
                ],
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
  const translate = useTranslate();
  const openChild = useOpenContextualChild();
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
      title={translate("assets.assets.history.title", { ns: "starter" }, "Assignment history")}
      action={
        <Button
          variant="outline"
          size="sm"
          disabled={hasActive}
          title={
            hasActive
              ? translate(
                  "assets.assets.history.returnActiveFirst",
                  { ns: "starter" },
                  "Return the active assignment before reassigning"
                )
              : translate("assets.assets.history.assignThis", { ns: "starter" }, "Assign this device")
          }
          onClick={() => openChild("assign")}
        >
          <Plus />
          {translate("assets.assets.history.assign", { ns: "starter" }, "Assign")}
        </Button>
      }
    >
      <SimpleTable
        headers={[
          translate("assets.assets.history.headers.assignee", { ns: "starter" }, "Assignee"),
          translate("assets.assets.history.headers.assigned", { ns: "starter" }, "Assigned"),
          translate("assets.assets.history.headers.returned", { ns: "starter" }, "Returned"),
          translate("assets.assets.history.headers.note", { ns: "starter" }, "Note"),
          translate("assets.common.actions", { ns: "starter" }, "Actions"),
        ]}
      >
        {result.data.length === 0 ? (
          <EmptyRow
            colSpan={5}
            text={translate(
              "assets.assets.history.empty",
              { ns: "starter" },
              "Never assigned. Use Assign to hand this device to someone."
            )}
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
                      label={translate("assets.assignments.active", { ns: "starter" }, "Active")}
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
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={translate("assets.common.view", { ns: "starter" }, "View")}
                      onClick={() =>
                        openChild(
                          `assignments/show/${encodeURIComponent(String(assignment.id))}`
                        )
                      }
                    >
                      <Eye />
                    </Button>
                    {active ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => returnAssignment(assignment)}
                      >
                        <Undo2 />
                        {translate("assets.assignments.actions.return", { ns: "starter" }, "Return")}
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </SimpleTable>
    </DrawerSection>
  );
}
