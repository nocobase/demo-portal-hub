import { useCreate, useShow, useTranslate, useUpdate } from "@refinedev/core";
import { ArrowRightCircle, Pencil } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useOutlet, useParams } from "react-router";
import { useRouteSurfaceClose } from "@nocobase/portal-sdk/routing";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RouteDrawer,
  RouteDrawerFooter,
} from "@/extensions/nocobase-route-surfaces";
import { LEAD_SOURCES, LEAD_STATUSES, formatDate, labelFor } from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import { DetailItems, EnumBadge, useLocale } from "../shared";
import type { LeadRecord } from "../types";

export function LeadShow() {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nestedDrawer = useOutlet();
  const { result: record, query } = useShow<LeadRecord>({
    resource: "hub_sales_leads",
    id,
    meta: { appends: ["owner"] },
  });

  const displayName =
    record?.name ||
    translate("sales.leads.detail.unnamed", { ns: "starter" }, "Unnamed lead");
  const converted = record?.status === "qualified";

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
        "sales.leads.drawer.show.description",
        { ns: "starter" },
        "Lead details, qualification and conversion."
      )}
      closeLabel={translate("sales.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nestedDrawer}
      actions={
        record ? (
          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="sm"
              disabled={converted}
              onClick={() => openChild("convert")}
            >
              <ArrowRightCircle />
              {converted
                ? translate(
                    "sales.leads.detail.converted",
                    { ns: "starter" },
                    "Converted"
                  )
                : translate(
                    "sales.leads.detail.convert",
                    { ns: "starter" },
                    "Convert"
                  )}
            </Button>
            <EditButton
              resource="hub_sales_leads"
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
                "sales.leads.detail.loadError.title",
                { ns: "starter" },
                "Unable to load lead"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "sales.leads.detail.loadError.description",
                { ns: "starter" },
                "The lead may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate(
                "sales.leads.detail.profile",
                { ns: "starter" },
                "Profile"
              )}
              items={[
                [
                  translate(
                    "sales.leads.fields.company",
                    { ns: "starter" },
                    "Company"
                  ),
                  record?.company || "—",
                ],
                [
                  translate("sales.leads.fields.email", { ns: "starter" }, "Email"),
                  record?.email || "—",
                ],
                [
                  translate(
                    "sales.leads.fields.source",
                    { ns: "starter" },
                    "Source"
                  ),
                  record?.source ? (
                    <EnumBadge
                      key="source"
                      value={record.source}
                      label={labelFor(LEAD_SOURCES, record.source, translate)}
                    />
                  ) : (
                    "—"
                  ),
                ],
                [
                  translate(
                    "sales.leads.fields.status",
                    { ns: "starter" },
                    "Status"
                  ),
                  <EnumBadge
                    key="status"
                    value={record?.status ?? "new"}
                    label={labelFor(LEAD_STATUSES, record?.status ?? "new", translate)}
                  />,
                ],
                [
                  translate("sales.leads.fields.owner", { ns: "starter" }, "Owner"),
                  record?.owner
                    ? record.owner.nickname || record.owner.username || "—"
                    : "—",
                ],
                [
                  translate(
                    "sales.leads.detail.createdAt",
                    { ns: "starter" },
                    "Captured"
                  ),
                  formatDate(record?.createdAt, locale),
                ],
              ]}
            />
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

export function ConvertLead() {
  const translate = useTranslate();
  const { id } = useParams<{ id: string }>();
  const closeTo = useContextualCloseTo();
  const close = useRouteSurfaceClose();
  const { result: lead, query } = useShow<LeadRecord>({
    resource: "hub_sales_leads",
    id,
  });
  const { mutateAsync: createAccount } = useCreate();
  const { mutateAsync: createContact } = useCreate();
  const { mutateAsync: createDeal } = useCreate();
  const { mutateAsync: updateLead } = useUpdate();

  const [accountName, setAccountName] = useState("");
  const [contactName, setContactName] = useState("");
  const [dealTitle, setDealTitle] = useState("");
  const [dealAmount, setDealAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lead) return;
    setAccountName((current) => current || lead.company || lead.name || "");
    setContactName((current) => current || lead.name || "");
    setDealTitle(
      (current) =>
        current ||
        (lead.company
          ? `${lead.company} — new opportunity`
          : translate(
              "sales.leads.detail.convert.dealTitleDefault",
              { ns: "starter" },
              "New opportunity"
            ))
    );
  }, [lead, translate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!lead || !id) return;
    setSubmitting(true);
    setError(null);
    try {
      const ownerId = lead.owner_id ? Number(lead.owner_id) : null;
      const accountResult = await createAccount({
        resource: "hub_sales_accounts",
        values: { name: accountName, owner: ownerId },
      });
      const accountId = accountResult?.data?.id;
      await createContact({
        resource: "hub_sales_contacts",
        values: {
          name: contactName,
          email: lead.email ?? null,
          account: accountId ?? null,
        },
      });
      await createDeal({
        resource: "hub_sales_deals",
        values: {
          title: dealTitle,
          stage: "inquiry",
          amount: dealAmount ? Number(dealAmount) : null,
          account: accountId ?? null,
          owner: ownerId,
        },
      });
      await updateLead({
        resource: "hub_sales_leads",
        id,
        values: { status: "qualified" },
      });
      close({ skipBeforeClose: true });
    } catch {
      setError(
        translate(
          "sales.leads.detail.convert.error",
          { ns: "starter" },
          "Conversion failed. Check the fields and try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RouteDrawer
      title={translate(
        "sales.leads.detail.convert.title",
        { ns: "starter" },
        "Convert lead"
      )}
      description={translate(
        "sales.leads.detail.convert.description",
        { ns: "starter" },
        "Create an account, contact and deal from this lead."
      )}
      closeTo={closeTo}
      closeLabel={translate("sales.common.close", { ns: "starter" }, "Close")}
    >
      {query.isLoading ? (
        <LoadingState className="min-h-64" />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="convert-account-name">
                {translate(
                  "sales.leads.detail.convert.accountName",
                  { ns: "starter" },
                  "Account name"
                )}
              </Label>
              <Input
                id="convert-account-name"
                value={accountName}
                onChange={(event) => setAccountName(event.currentTarget.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="convert-contact-name">
                {translate(
                  "sales.leads.detail.convert.contactName",
                  { ns: "starter" },
                  "Primary contact"
                )}
              </Label>
              <Input
                id="convert-contact-name"
                value={contactName}
                onChange={(event) => setContactName(event.currentTarget.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="convert-deal-title">
                {translate(
                  "sales.leads.detail.convert.dealTitle",
                  { ns: "starter" },
                  "Deal title"
                )}
              </Label>
              <Input
                id="convert-deal-title"
                value={dealTitle}
                onChange={(event) => setDealTitle(event.currentTarget.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="convert-deal-amount">
                {translate(
                  "sales.leads.detail.convert.dealAmount",
                  { ns: "starter" },
                  "Deal amount (optional)"
                )}
              </Label>
              <Input
                id="convert-deal-amount"
                type="number"
                min={0}
                step="0.01"
                value={dealAmount}
                onChange={(event) => setDealAmount(event.currentTarget.value)}
                placeholder="88000"
              />
            </div>
          </div>
          <RouteDrawerFooter className="flex-row justify-end">
            <Button type="button" variant="outline" onClick={() => close()}>
              {translate("sales.common.cancel", { ns: "starter" }, "Cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? translate(
                    "sales.leads.detail.convert.submitting",
                    { ns: "starter" },
                    "Converting..."
                  )
                : translate(
                    "sales.leads.detail.convert.submit",
                    { ns: "starter" },
                    "Convert lead"
                  )}
            </Button>
          </RouteDrawerFooter>
        </form>
      )}
    </RouteDrawer>
  );
}
