import { useShow, useTranslate, useUpdate } from "@refinedev/core";
import { Pencil, Undo2 } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import { assigneeName, formatDate, todayIso } from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import { DetailItems, Pill, useLocale } from "../shared";
import type { AssetRecord, AssignmentRecord } from "../types";

// Detail drawer for a single assignment. `idParam` lets it read the record id
// from a differently-named route param when it is opened as a nested surface
// from the asset detail drawer (`.../assignments/show/:asgId`).
export function AssignmentShow({
  idParam = "id",
}: { idParam?: string } = {}) {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const params = useParams<Record<string, string>>();
  const id = params[idParam];
  const nested = useOutlet();
  const { mutate: updateAssignment } = useUpdate<AssignmentRecord>();
  const { mutate: updateAsset } = useUpdate<AssetRecord>();
  const { result: record, query } = useShow<AssignmentRecord>({
    resource: "hub_as_assignments",
    id,
    meta: { appends: ["asset", "assignee"] },
  });

  const active = record ? !record.returned_date : false;

  const returnAssignment = () => {
    if (!record) return;
    updateAssignment(
      {
        resource: "hub_as_assignments",
        id: record.id,
        values: { returned_date: todayIso() },
      },
      {
        onSuccess: () => {
          if (record.asset_id != null) {
            updateAsset({
              resource: "hub_as_assets",
              id: record.asset_id,
              values: { status: "in_stock" },
            });
          }
        },
      }
    );
  };

  const displayName =
    record?.asset?.name ||
    record?.asset?.tag ||
    translate("assets.assignments.show.unnamed", { ns: "starter" }, "Assignment");

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
        "assets.assignments.show.description",
        { ns: "starter" },
        "Details for this device assignment."
      )}
      closeLabel={translate("assets.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nested}
      actions={
        record ? (
          <div className="flex items-center gap-2">
            {active ? (
              <Button variant="outline" size="sm" onClick={returnAssignment}>
                <Undo2 />
                {translate("assets.assignments.actions.return", { ns: "starter" }, "Return")}
              </Button>
            ) : null}
            <EditButton
              resource="hub_as_assignments"
              recordItemId={record.id}
              variant="outline"
              size="icon-sm"
              onClick={() => openChild("edit")}
            >
              <Pencil />
            </EditButton>
          </div>
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
                "assets.assignments.show.error.title",
                { ns: "starter" },
                "Unable to load assignment"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "assets.assignments.show.error.description",
                { ns: "starter" },
                "The assignment may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <DetailItems
            title={translate("assets.assignments.show.overview", { ns: "starter" }, "Overview")}
            items={[
              [
                translate("assets.assignments.fields.asset", { ns: "starter" }, "Asset"),
                record?.asset ? (
                  <span key="asset" className="flex flex-col">
                    <span className="font-medium">{record.asset.name || "—"}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {record.asset.tag || ""}
                    </span>
                  </span>
                ) : (
                  "—"
                ),
              ],
              [
                translate("assets.assignments.fields.assignee", { ns: "starter" }, "Assignee"),
                assigneeName(record?.assignee),
              ],
              [
                translate("assets.assignments.fields.assignedDate", { ns: "starter" }, "Assigned date"),
                formatDate(record?.assigned_date, locale),
              ],
              [
                translate("assets.assignments.columns.status", { ns: "starter" }, "Status"),
                active ? (
                  <Pill
                    key="status"
                    label={translate("assets.assignments.active", { ns: "starter" }, "Active")}
                    className="bg-blue-500/15 text-blue-700 dark:text-blue-300"
                  />
                ) : (
                  <span key="status">
                    {translate("assets.assignments.returnedPrefix", { ns: "starter" }, "Returned")}{" "}
                    {formatDate(record?.returned_date, locale)}
                  </span>
                ),
              ],
              [
                translate("assets.assignments.fields.note", { ns: "starter" }, "Note"),
                record?.note || "—",
              ],
            ]}
          />
        )}
      </div>
    </RouteDrawer>
  );
}
