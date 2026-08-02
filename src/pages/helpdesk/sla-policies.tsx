import {
  type HttpError,
  useList,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Check, Plus, Save, Trash2 } from "lucide-react";
import { Link, Outlet, useParams } from "react-router";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { LoadingState } from "@/components/app-shell/loading-state";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouteSurfaceClose } from "@nocobase/portal-sdk/routing";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
} from "@/extensions/nocobase-route-surfaces";
import { TICKET_PRIORITIES, labelFor } from "./constants";
import { getSlaPolicyShowPath, helpdeskRoutes } from "./routes";
import { PriorityPill } from "./shared";
import type { SlaPolicyFormValues, SlaPolicyRecord } from "./types";

const RESOURCE = "hub_hd_sla_policies";

// ---------------------------------------------------------------------------
// SLA policies — a plain table (no board here, unlike tickets: a policy
// list is inherently flat) with a URL-addressable detail/edit drawer that
// opens on row click. Editing saves in place, no nested route needed since
// there is only one editable surface per policy.
// ---------------------------------------------------------------------------

export function SlaPoliciesLayout() {
  return (
    <>
      <SlaPoliciesPage />
      <Outlet />
    </>
  );
}

function minutesLabel(
  mins: number | null | undefined,
  translate: ReturnType<typeof useTranslate>
) {
  if (mins === null || mins === undefined) return "—";
  if (mins % 60 === 0 && mins >= 60) {
    const hrs = mins / 60;
    return translate("helpdesk.sla.hours", { ns: "starter", count: hrs }, `${hrs}h`);
  }
  return translate("helpdesk.sla.minutes", { ns: "starter", count: mins }, `${mins}m`);
}

function SlaPoliciesPage() {
  const translate = useTranslate();

  const { result, query } = useList<SlaPolicyRecord>({
    resource: RESOURCE,
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    sorters: [{ field: "id", order: "asc" }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const policies = result.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {translate("helpdesk.sla.title", { ns: "starter" }, "SLA policies")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {translate(
                "helpdesk.sla.subtitle",
                { ns: "starter" },
                "Response and resolution targets for each priority level."
              )}
            </p>
          </div>
          <Button render={<Link to={helpdeskRoutes.slaPoliciesCreate} />}>
            <Plus className="size-4" />
            {translate("helpdesk.sla.new", { ns: "starter" }, "New policy")}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {query.isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">
                    {translate("helpdesk.sla.columns.name", { ns: "starter" }, "Policy")}
                  </th>
                  <th className="px-4 py-2.5 font-medium">
                    {translate("helpdesk.sla.columns.priority", { ns: "starter" }, "Priority")}
                  </th>
                  <th className="px-4 py-2.5 font-medium">
                    {translate("helpdesk.sla.columns.response", { ns: "starter" }, "Response target")}
                  </th>
                  <th className="px-4 py-2.5 font-medium">
                    {translate("helpdesk.sla.columns.resolve", { ns: "starter" }, "Resolve target")}
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    {translate("helpdesk.sla.columns.actions", { ns: "starter" }, "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b border-border/50 last:border-0">
                    <td className="px-0 py-0">
                      <Link
                        to={getSlaPolicyShowPath(policy.id)}
                        className="block px-4 py-3 font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {policy.name || "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityPill
                        value={policy.priority}
                        label={labelFor(TICKET_PRIORITIES, policy.priority, translate)}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {minutesLabel(policy.response_mins, translate)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {minutesLabel(policy.resolve_mins, translate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteButton
                        resource={RESOURCE}
                        recordItemId={policy.id}
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 />
                      </DeleteButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail/edit drawer — URL-addressable at /sla-policies/show/:id. Combines
// display + inline edit in one surface since there's a single editable form
// per policy (no need for a separate nested edit route).
// ---------------------------------------------------------------------------

type SlaFormValues = {
  name: string;
  response_mins: number;
  resolve_mins: number;
};

// ---------------------------------------------------------------------------
// Create drawer — URL-addressable at /sla-policies/create. Adds a new policy
// for a priority level (priority is picked here; on the edit surface it is a
// read-only pill since it identifies the policy).
// ---------------------------------------------------------------------------

export function SlaPolicyCreate() {
  const translate = useTranslate();
  const close = useRouteSurfaceClose();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SlaPolicyRecord, HttpError, SlaPolicyFormValues>({
    refineCoreProps: {
      resource: RESOURCE,
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      name: "",
      priority: "med",
      response_mins: 60,
      resolve_mins: 480,
    },
  });

  return (
    <>
      <RouteDrawer
        title={translate("helpdesk.sla.create.title", { ns: "starter" }, "New SLA policy")}
        description={translate(
          "helpdesk.sla.create.description",
          { ns: "starter" },
          "Define response and resolution targets for a priority level."
        )}
        closeLabel={translate("buttons.close", "Close")}
        closeTo={helpdeskRoutes.slaPolicies}
        beforeClose={beforeClose}
      >
        <form
          onSubmit={handleSubmit((values) =>
            onFinish({
              name: values.name,
              priority: values.priority,
              response_mins: Number(values.response_mins),
              resolve_mins: Number(values.resolve_mins),
            })
          )}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="sla-new-name">
                {translate("helpdesk.sla.fields.name", { ns: "starter" }, "Policy name")}
              </Label>
              <Input id="sla-new-name" {...register("name", { required: true })} autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sla-new-priority">
                {translate("helpdesk.sla.fields.priority", { ns: "starter" }, "Priority")}
              </Label>
              <NativeSelect id="sla-new-priority" {...register("priority", { required: true })}>
                {TICKET_PRIORITIES.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {labelFor(TICKET_PRIORITIES, option.value, translate)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sla-new-response">
                  {translate("helpdesk.sla.fields.responseMins", { ns: "starter" }, "Response target (minutes)")}
                </Label>
                <Input
                  id="sla-new-response"
                  type="number"
                  min={1}
                  {...register("response_mins", { required: true, valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla-new-resolve">
                  {translate("helpdesk.sla.fields.resolveMins", { ns: "starter" }, "Resolve target (minutes)")}
                </Label>
                <Input
                  id="sla-new-resolve"
                  type="number"
                  min={1}
                  {...register("resolve_mins", { required: true, valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
          <RouteDrawerFooter className="flex-row justify-end">
            <Button type="button" variant="outline" onClick={() => close()}>
              {translate("buttons.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? translate("helpdesk.sla.create.submitting", { ns: "starter" }, "Creating...")
                : translate("helpdesk.sla.create.submit", { ns: "starter" }, "Create policy")}
            </Button>
          </RouteDrawerFooter>
        </form>
      </RouteDrawer>
      {confirmation}
    </>
  );
}

export function SlaPolicyShow() {
  const translate = useTranslate();
  const { id } = useParams<{ id: string }>();

  const { result: policy, query } = useShow<SlaPolicyRecord>({
    resource: RESOURCE,
    id,
  });

  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = useForm<SlaPolicyRecord, HttpError, SlaFormValues>({
    refineCoreProps: {
      resource: RESOURCE,
      id,
      action: "edit",
      redirect: false,
    },
  });

  const title =
    policy?.name ||
    (query.isLoading ? "" : translate("helpdesk.sla.title", { ns: "starter" }, "SLA policies"));

  return (
    <RouteDrawer
      title={
        query.isLoading && !policy ? <Skeleton className="h-6 w-48" /> : title
      }
      description={translate(
        "helpdesk.sla.show.description",
        { ns: "starter" },
        "Edit the response and resolution targets for this priority."
      )}
      closeLabel={translate("buttons.close", "Close")}
      closeTo={helpdeskRoutes.slaPolicies}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {query.isLoading ? (
          <LoadingState className="min-h-64" />
        ) : query.isError || !policy ? (
          <Alert variant="destructive">
            <AlertTitle>
              {translate("helpdesk.sla.show.errorTitle", { ns: "starter" }, "Unable to load SLA policy")}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "helpdesk.sla.show.errorDescription",
                { ns: "starter" },
                "The policy may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <form
            onSubmit={handleSubmit((values) =>
              onFinish({
                name: values.name,
                response_mins: Number(values.response_mins),
                resolve_mins: Number(values.resolve_mins),
              })
            )}
            className="space-y-5"
          >
            <div className="flex items-center gap-2">
              <PriorityPill
                value={policy.priority}
                label={labelFor(TICKET_PRIORITIES, policy.priority, translate)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="sla-name">
                {translate("helpdesk.sla.fields.name", { ns: "starter" }, "Policy name")}
              </Label>
              <Input id="sla-name" {...register("name", { required: true })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sla-response">
                  {translate("helpdesk.sla.fields.responseMins", { ns: "starter" }, "Response target (minutes)")}
                </Label>
                <Input
                  id="sla-response"
                  type="number"
                  min={1}
                  {...register("response_mins", { required: true, valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla-resolve">
                  {translate("helpdesk.sla.fields.resolveMins", { ns: "starter" }, "Resolve target (minutes)")}
                </Label>
                <Input
                  id="sla-resolve"
                  type="number"
                  min={1}
                  {...register("resolve_mins", { required: true, valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {isSubmitSuccessful && !formLoading ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3.5" />
                  {translate("helpdesk.sla.form.saved", { ns: "starter" }, "Saved")}
                </span>
              ) : null}
              <Button type="submit" disabled={formLoading}>
                <Save className={cn("size-4", formLoading && "animate-pulse")} />
                {formLoading
                  ? translate("helpdesk.sla.form.saving", { ns: "starter" }, "Saving...")
                  : translate("helpdesk.sla.form.save", { ns: "starter" }, "Save changes")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </RouteDrawer>
  );
}
