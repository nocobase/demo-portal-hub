import { useShow, useTranslate, useUpdate } from "@refinedev/core";
import { Check, Pencil, X } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  LEAVE_STATUSES,
  LEAVE_TYPES,
  formatDate,
  labelFor,
} from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import { DetailItems, EnumBadge, useLocale } from "../shared";
import type { LeaveRequestRecord } from "../types";

export function LeaveShow({ idParam = "id" }: { idParam?: string } = {}) {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const params = useParams();
  const id = params[idParam];
  const nestedDrawer = useOutlet();
  const { result: record, query } = useShow<LeaveRequestRecord>({
    resource: "hub_hr_leave_requests",
    id,
    meta: { appends: ["employee"] },
  });
  const { mutate: updateLeave, mutation } = useUpdate<LeaveRequestRecord>();

  const setStatus = (status: string) => {
    if (!record) return;
    updateLeave({
      resource: "hub_hr_leave_requests",
      id: record.id,
      values: { status },
      successNotification: {
        type: "success",
        message: translate(
          `hr.leave.notification.${status}`,
          { ns: "starter" },
          `Request ${status}`
        ),
      },
    });
  };

  const displayName =
    record?.employee?.name ||
    translate("hr.leave.detail.unnamed", { ns: "starter" }, "Leave request");

  const isPending = (record?.status ?? "pending") === "pending";

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
        "hr.leave.drawer.show.description",
        { ns: "starter" },
        "Review the request and record a decision."
      )}
      closeLabel={translate("hr.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nestedDrawer}
      actions={
        record ? (
          <EditButton
            resource="hub_hr_leave_requests"
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
                "hr.leave.detail.loadError.title",
                { ns: "starter" },
                "Unable to load request"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "hr.leave.detail.loadError.description",
                { ns: "starter" },
                "The request may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate("hr.leave.detail.info", { ns: "starter" }, "Request")}
              items={[
                [
                  translate("hr.leave.fields.employee", { ns: "starter" }, "Employee"),
                  record?.employee?.name || "—",
                ],
                [
                  translate("hr.leave.fields.type", { ns: "starter" }, "Type"),
                  <EnumBadge
                    key="type"
                    value={record?.type ?? "annual"}
                    label={labelFor(LEAVE_TYPES, record?.type ?? "annual", translate)}
                  />,
                ],
                [
                  translate("hr.leave.fields.dates", { ns: "starter" }, "Dates"),
                  `${formatDate(record?.start_date, locale)} – ${formatDate(record?.end_date, locale)}`,
                ],
                [
                  translate("hr.leave.fields.days", { ns: "starter" }, "Days"),
                  record?.days ?? "—",
                ],
                [
                  translate("hr.leave.fields.status", { ns: "starter" }, "Status"),
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "pending"}
                    label={labelFor(LEAVE_STATUSES, record?.status ?? "pending", translate)}
                  />,
                ],
                [
                  translate("hr.leave.fields.reason", { ns: "starter" }, "Reason"),
                  record?.reason || "—",
                ],
              ]}
            />
            <div className="flex items-center gap-2">
              {isPending ? (
                <>
                  <Button
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                    disabled={mutation.isPending}
                    onClick={() => setStatus("approved")}
                  >
                    <Check />
                    {translate("hr.leave.actions.approve", { ns: "starter" }, "Approve")}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500/40 text-red-700 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400"
                    disabled={mutation.isPending}
                    onClick={() => setStatus("rejected")}
                  >
                    <X />
                    {translate("hr.leave.actions.reject", { ns: "starter" }, "Reject")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => setStatus("pending")}
                >
                  {translate("hr.leave.actions.reopen", { ns: "starter" }, "Reopen")}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}
