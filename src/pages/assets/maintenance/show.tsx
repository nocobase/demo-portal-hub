import { useShow, useTranslate } from "@refinedev/core";
import { Pencil } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
  formatCurrency,
  formatDate,
  labelFor,
  maintenanceStatusBadgeClass,
  maintenanceTypeBadgeClass,
} from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import { DetailItems, Pill, useLocale } from "../shared";
import type { MaintenanceRecord } from "../types";

// Detail drawer for a single maintenance record. `idParam` lets it read the
// record id from a differently-named route param when it is opened as a nested
// surface from the asset detail drawer (`.../maintenance/show/:mId`).
export function MaintenanceShow({
  idParam = "id",
}: { idParam?: string } = {}) {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const params = useParams<Record<string, string>>();
  const id = params[idParam];
  const nested = useOutlet();
  const { result: record, query } = useShow<MaintenanceRecord>({
    resource: "hub_as_maintenance",
    id,
    meta: { appends: ["asset"] },
  });

  const displayName =
    record?.title ||
    translate("assets.maintenance.show.unnamed", { ns: "starter" }, "Maintenance");

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
        "assets.maintenance.show.description",
        { ns: "starter" },
        "Details for this maintenance record."
      )}
      closeLabel={translate("assets.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nested}
      actions={
        record ? (
          <EditButton
            resource="hub_as_maintenance"
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
                "assets.maintenance.show.error.title",
                { ns: "starter" },
                "Unable to load maintenance record"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "assets.maintenance.show.error.description",
                { ns: "starter" },
                "The record may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <DetailItems
            title={translate("assets.maintenance.show.overview", { ns: "starter" }, "Overview")}
            items={[
              [
                translate("assets.maintenance.fields.asset", { ns: "starter" }, "Asset"),
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
                translate("assets.maintenance.fields.type", { ns: "starter" }, "Type"),
                record?.type ? (
                  <Pill
                    key="type"
                    label={labelFor(MAINTENANCE_TYPES, record.type, translate)}
                    className={maintenanceTypeBadgeClass(record.type)}
                  />
                ) : (
                  "—"
                ),
              ],
              [
                translate("assets.maintenance.fields.status", { ns: "starter" }, "Status"),
                record?.status ? (
                  <Pill
                    key="status"
                    label={labelFor(MAINTENANCE_STATUSES, record.status, translate)}
                    className={maintenanceStatusBadgeClass(record.status)}
                  />
                ) : (
                  "—"
                ),
              ],
              [
                translate("assets.maintenance.fields.scheduledDate", { ns: "starter" }, "Scheduled date"),
                formatDate(record?.scheduled_date, locale),
              ],
              [
                translate("assets.maintenance.fields.completedDate", { ns: "starter" }, "Completed date"),
                formatDate(record?.completed_date, locale),
              ],
              [
                translate("assets.maintenance.fields.cost", { ns: "starter" }, "Cost"),
                record?.cost != null ? formatCurrency(record.cost, locale) : "—",
              ],
              [
                translate("assets.maintenance.fields.vendor", { ns: "starter" }, "Vendor"),
                record?.vendor || "—",
              ],
              [
                translate("assets.maintenance.fields.notes", { ns: "starter" }, "Notes"),
                record?.notes || "—",
              ],
            ]}
          />
        )}
      </div>
    </RouteDrawer>
  );
}
