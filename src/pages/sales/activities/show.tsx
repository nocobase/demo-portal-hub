import { useShow, useTranslate } from "@refinedev/core";
import { Pencil } from "lucide-react";
import { useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import { ACTIVITY_TYPES, formatDateTime, labelFor } from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import { DetailItems, EnumBadge, useLocale } from "../shared";
import type { ActivityRecord } from "../types";

export function ActivityShow() {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const { result: record, query } = useShow<ActivityRecord>({
    resource: "hub_sales_activities",
    id,
    meta: { appends: ["deal"] },
  });

  const displayName =
    record?.subject ||
    translate(
      "sales.activities.detail.unnamed",
      { ns: "starter" },
      "Untitled activity"
    );

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
        "sales.activities.drawer.show.description",
        { ns: "starter" },
        "Full details of this logged activity."
      )}
      closeLabel={translate("sales.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      actions={
        record ? (
          <EditButton
            resource="hub_sales_activities"
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
                "sales.activities.detail.loadError.title",
                { ns: "starter" },
                "Unable to load activity"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "sales.activities.detail.loadError.description",
                { ns: "starter" },
                "The activity may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate(
                "sales.activities.detail.profile",
                { ns: "starter" },
                "Details"
              )}
              items={[
                [
                  translate(
                    "sales.activities.fields.type",
                    { ns: "starter" },
                    "Type"
                  ),
                  <EnumBadge
                    key="type"
                    value={record?.type ?? "call"}
                    label={labelFor(ACTIVITY_TYPES, record?.type ?? "call", translate)}
                  />,
                ],
                [
                  translate(
                    "sales.activities.fields.date",
                    { ns: "starter" },
                    "Date"
                  ),
                  formatDateTime(record?.date, locale),
                ],
                [
                  translate(
                    "sales.activities.fields.deal",
                    { ns: "starter" },
                    "Deal"
                  ),
                  record?.deal?.title || "—",
                ],
              ]}
            />
            <section className="space-y-2">
              <h3 className="text-sm font-medium">
                {translate(
                  "sales.activities.fields.notes",
                  { ns: "starter" },
                  "Notes"
                )}
              </h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {record?.notes ||
                  translate(
                    "sales.activities.detail.noNotes",
                    { ns: "starter" },
                    "No notes recorded."
                  )}
              </p>
            </section>
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}
