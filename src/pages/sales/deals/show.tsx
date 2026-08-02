import { useList, useShow, useTranslate } from "@refinedev/core";
import { Pencil, Plus } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  ACTIVITY_TYPES,
  DEAL_STAGES,
  formatCurrency,
  formatDate,
  formatDateTime,
  labelFor,
} from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import {
  DetailItems,
  DrawerSection,
  EmptyRow,
  EnumBadge,
  SimpleTable,
  useLocale,
} from "../shared";
import type { ActivityRecord, DealRecord } from "../types";

export function DealShow({ idParam = "id" }: { idParam?: string } = {}) {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const params = useParams<Record<string, string>>();
  const id = params[idParam];
  const nestedDrawer = useOutlet();
  const { result: record, query } = useShow<DealRecord>({
    resource: "hub_sales_deals",
    id,
    meta: { appends: ["account", "owner"] },
  });

  const displayName =
    record?.title ||
    translate("sales.deals.detail.unnamed", { ns: "starter" }, "Untitled deal");

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
        "sales.deals.drawer.show.description",
        { ns: "starter" },
        "Value, stage and activity history for this deal."
      )}
      closeLabel={translate("sales.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nestedDrawer}
      actions={
        record ? (
          <EditButton
            resource="hub_sales_deals"
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
                "sales.deals.detail.loadError.title",
                { ns: "starter" },
                "Unable to load deal"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "sales.deals.detail.loadError.description",
                { ns: "starter" },
                "The deal may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate(
                "sales.deals.detail.profile",
                { ns: "starter" },
                "Overview"
              )}
              items={[
                [
                  translate(
                    "sales.deals.fields.account",
                    { ns: "starter" },
                    "Account"
                  ),
                  record?.account?.name || "—",
                ],
                [
                  translate("sales.deals.fields.stage", { ns: "starter" }, "Stage"),
                  <EnumBadge
                    key="stage"
                    value={record?.stage ?? "inquiry"}
                    label={labelFor(
                      DEAL_STAGES,
                      record?.stage ?? "inquiry",
                      translate
                    )}
                  />,
                ],
                [
                  translate(
                    "sales.deals.fields.amount",
                    { ns: "starter" },
                    "Amount"
                  ),
                  formatCurrency(record?.amount, locale),
                ],
                [
                  translate(
                    "sales.deals.fields.expectedClose",
                    { ns: "starter" },
                    "Expected close"
                  ),
                  formatDate(record?.expected_close_date, locale),
                ],
                [
                  translate("sales.deals.fields.owner", { ns: "starter" }, "Owner"),
                  record?.owner
                    ? record.owner.nickname || record.owner.username || "—"
                    : "—",
                ],
                [
                  translate(
                    "sales.deals.detail.createdAt",
                    { ns: "starter" },
                    "Created"
                  ),
                  formatDate(record?.createdAt, locale),
                ],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <ActivitiesSection
                  dealId={id}
                  locale={locale}
                  openChild={openChild}
                />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

function ActivitiesSection({
  dealId,
  locale,
  openChild,
}: {
  dealId: string;
  locale: string;
  openChild: (to: string) => void;
}) {
  const translate = useTranslate();
  const { result } = useList<ActivityRecord>({
    resource: "hub_sales_activities",
    pagination: { mode: "server", currentPage: 1, pageSize: 50 },
    sorters: [{ field: "date", order: "desc" }],
    filters: [{ field: "deal_id", operator: "eq", value: dealId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  return (
    <DrawerSection
      title={translate(
        "sales.deals.detail.activities",
        { ns: "starter" },
        "Activity history"
      )}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => openChild("activities/create")}
        >
          <Plus />
          {translate(
            "sales.activities.actions.log",
            { ns: "starter" },
            "Log activity"
          )}
        </Button>
      }
    >
      <SimpleTable
        headers={[
          translate("sales.activities.fields.date", { ns: "starter" }, "Date"),
          translate("sales.activities.fields.type", { ns: "starter" }, "Type"),
          translate(
            "sales.activities.fields.subject",
            { ns: "starter" },
            "Subject"
          ),
        ]}
      >
        {result.data.length === 0 ? (
          <EmptyRow
            colSpan={3}
            text={translate(
              "sales.activities.empty",
              { ns: "starter" },
              "No activity logged for this deal yet."
            )}
          />
        ) : (
          result.data.map((activity) => (
            <tr key={String(activity.id)}>
              <td className="px-3 py-2 whitespace-nowrap">
                {formatDateTime(activity.date, locale)}
              </td>
              <td className="px-3 py-2">
                <EnumBadge
                  value={activity.type ?? "call"}
                  label={labelFor(ACTIVITY_TYPES, activity.type ?? "call", translate)}
                />
              </td>
              <td className="px-3 py-2 font-medium">{activity.subject || "—"}</td>
            </tr>
          ))
        )}
      </SimpleTable>
    </DrawerSection>
  );
}
