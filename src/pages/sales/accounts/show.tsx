import { useList, useShow, useTranslate } from "@refinedev/core";
import { Mail, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import { useMemo } from "react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  ACTIVITY_TYPES,
  DEAL_STAGES,
  INDUSTRIES,
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
import type { AccountRecord, ActivityRecord, ContactRecord, DealRecord } from "../types";

export function AccountShow() {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nestedDrawer = useOutlet();
  const { result: record, query } = useShow<AccountRecord>({
    resource: "hub_sales_accounts",
    id,
    meta: { appends: ["owner"] },
  });

  const displayName =
    record?.name ||
    translate("sales.accounts.detail.unnamed", { ns: "starter" }, "Unnamed account");

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
        "sales.accounts.drawer.show.description",
        { ns: "starter" },
        "Profile, contacts and deals for this account."
      )}
      closeLabel={translate("sales.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nestedDrawer}
      actions={
        record ? (
          <EditButton
            resource="hub_sales_accounts"
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
                "sales.accounts.detail.loadError.title",
                { ns: "starter" },
                "Unable to load account"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "sales.accounts.detail.loadError.description",
                { ns: "starter" },
                "The account may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate(
                "sales.accounts.detail.profile",
                { ns: "starter" },
                "Profile"
              )}
              items={[
                [
                  translate(
                    "sales.accounts.fields.industry",
                    { ns: "starter" },
                    "Industry"
                  ),
                  record?.industry
                    ? labelFor(INDUSTRIES, record.industry, translate)
                    : "—",
                ],
                [
                  translate(
                    "sales.accounts.fields.owner",
                    { ns: "starter" },
                    "Owner"
                  ),
                  record?.owner
                    ? record.owner.nickname || record.owner.username || "—"
                    : "—",
                ],
                [
                  translate(
                    "sales.accounts.fields.website",
                    { ns: "starter" },
                    "Website"
                  ),
                  record?.website ? (
                    <a
                      key="website"
                      href={record.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {record.website}
                    </a>
                  ) : (
                    "—"
                  ),
                ],
                [
                  translate(
                    "sales.accounts.fields.accountSince",
                    { ns: "starter" },
                    "Account since"
                  ),
                  formatDate(record?.createdAt, locale),
                ],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <ContactsSection accountId={id} openChild={openChild} />
                <Separator />
                <DealsSection
                  accountId={id}
                  locale={locale}
                  openChild={openChild}
                />
                <Separator />
                <TimelineSection accountId={id} locale={locale} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

type OpenChild = (to: string) => void;

function AddLink({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Plus />
      {label}
    </Button>
  );
}

function ContactsSection({
  accountId,
  openChild,
}: {
  accountId: string;
  openChild: OpenChild;
}) {
  const translate = useTranslate();
  const { result } = useList<ContactRecord>({
    resource: "hub_sales_contacts",
    pagination: { mode: "server", currentPage: 1, pageSize: 50 },
    sorters: [{ field: "name", order: "asc" }],
    filters: [{ field: "account_id", operator: "eq", value: accountId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  return (
    <DrawerSection
      title={translate(
        "sales.accounts.detail.contacts",
        { ns: "starter" },
        "Contacts"
      )}
      action={
        <AddLink
          onClick={() => openChild("contacts/create")}
          label={translate(
            "sales.contacts.actions.add",
            { ns: "starter" },
            "Add contact"
          )}
        />
      }
    >
      <SimpleTable
        headers={[
          translate("sales.contacts.fields.name", { ns: "starter" }, "Name"),
          translate(
            "sales.contacts.fields.jobTitle",
            { ns: "starter" },
            "Job title"
          ),
          translate("sales.contacts.fields.email", { ns: "starter" }, "Email"),
          translate("sales.contacts.fields.phone", { ns: "starter" }, "Phone"),
          translate("sales.common.actions", { ns: "starter" }, "Actions"),
        ]}
      >
        {result.data.length === 0 ? (
          <EmptyRow
            colSpan={5}
            text={translate(
              "sales.contacts.empty",
              { ns: "starter" },
              "No contacts yet."
            )}
          />
        ) : (
          result.data.map((contact) => (
            <tr key={String(contact.id)}>
              <td className="px-3 py-2 font-medium">{contact.name || "—"}</td>
              <td className="px-3 py-2">{contact.title || "—"}</td>
              <td className="px-3 py-2">{contact.email || "—"}</td>
              <td className="px-3 py-2">{contact.phone || "—"}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      openChild(
                        `contacts/edit/${encodeURIComponent(String(contact.id))}`
                      )
                    }
                  >
                    <Pencil />
                  </Button>
                  <DeleteButton
                    resource="hub_sales_contacts"
                    recordItemId={contact.id}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </DeleteButton>
                </div>
              </td>
            </tr>
          ))
        )}
      </SimpleTable>
    </DrawerSection>
  );
}

function DealsSection({
  accountId,
  locale,
  openChild,
}: {
  accountId: string;
  locale: string;
  openChild: OpenChild;
}) {
  const translate = useTranslate();
  const { result } = useList<DealRecord>({
    resource: "hub_sales_deals",
    pagination: { mode: "server", currentPage: 1, pageSize: 50 },
    sorters: [{ field: "createdAt", order: "desc" }],
    filters: [{ field: "account_id", operator: "eq", value: accountId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  return (
    <DrawerSection
      title={translate(
        "sales.accounts.detail.deals",
        { ns: "starter" },
        "Deals"
      )}
      action={
        <AddLink
          onClick={() => openChild("deals/create")}
          label={translate("sales.deals.actions.add", { ns: "starter" }, "Add deal")}
        />
      }
    >
      <SimpleTable
        headers={[
          translate("sales.deals.fields.title", { ns: "starter" }, "Deal"),
          translate("sales.deals.fields.stage", { ns: "starter" }, "Stage"),
          translate("sales.deals.fields.amount", { ns: "starter" }, "Amount"),
          translate(
            "sales.deals.fields.expectedClose",
            { ns: "starter" },
            "Expected close"
          ),
          translate("sales.common.actions", { ns: "starter" }, "Actions"),
        ]}
      >
        {result.data.length === 0 ? (
          <EmptyRow
            colSpan={5}
            text={translate(
              "sales.deals.empty",
              { ns: "starter" },
              "No deals for this account yet."
            )}
          />
        ) : (
          result.data.map((deal) => (
            <tr key={String(deal.id)}>
              <td className="px-3 py-2 font-medium">{deal.title || "—"}</td>
              <td className="px-3 py-2">
                <EnumBadge
                  value={deal.stage ?? "inquiry"}
                  label={labelFor(DEAL_STAGES, deal.stage ?? "inquiry", translate)}
                />
              </td>
              <td className="px-3 py-2 tabular-nums">
                {formatCurrency(deal.amount, locale)}
              </td>
              <td className="px-3 py-2">
                {formatDate(deal.expected_close_date, locale)}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      openChild(
                        `deals/edit/${encodeURIComponent(String(deal.id))}`
                      )
                    }
                  >
                    <Pencil />
                  </Button>
                  <DeleteButton
                    resource="hub_sales_deals"
                    recordItemId={deal.id}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </DeleteButton>
                </div>
              </td>
            </tr>
          ))
        )}
      </SimpleTable>
    </DrawerSection>
  );
}

function activityIcon(type: string | null | undefined) {
  switch (type) {
    case "email":
      return Mail;
    case "meeting":
      return Users;
    default:
      return Phone;
  }
}

// Cross-entity timeline: pulls this account's deals, then every activity
// logged against any of those deals, merged into one chronological feed.
function TimelineSection({
  accountId,
  locale,
}: {
  accountId: string;
  locale: string;
}) {
  const translate = useTranslate();
  const { result: dealsResult } = useList<DealRecord>({
    resource: "hub_sales_deals",
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    filters: [{ field: "account_id", operator: "eq", value: accountId }],
    errorNotification: false,
    queryOptions: { retry: false },
  });
  const dealIds = useMemo(
    () => dealsResult.data.map((deal) => deal.id),
    [dealsResult.data]
  );

  const { result: activitiesResult } = useList<ActivityRecord>({
    resource: "hub_sales_activities",
    pagination: { mode: "server", currentPage: 1, pageSize: 50 },
    sorters: [{ field: "date", order: "desc" }],
    filters:
      dealIds.length > 0
        ? [{ field: "deal_id", operator: "in", value: dealIds }]
        : [],
    meta: { appends: ["deal"] },
    errorNotification: false,
    queryOptions: { retry: false, enabled: dealIds.length > 0 },
  });

  return (
    <DrawerSection
      title={translate(
        "sales.accounts.detail.timeline",
        { ns: "starter" },
        "Timeline"
      )}
    >
      {dealIds.length === 0 || activitiesResult.data.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {translate(
            "sales.accounts.detail.timeline.empty",
            { ns: "starter" },
            "No activity logged for this account's deals yet."
          )}
        </p>
      ) : (
        <ol className="space-y-3">
          {activitiesResult.data.map((activity) => {
            const Icon = activityIcon(activity.type);
            return (
              <li key={String(activity.id)} className="flex gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500/12 text-blue-600 dark:text-blue-400">
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="text-sm font-medium">
                      {activity.subject || "—"}
                    </span>
                    <span className="text-xs whitespace-nowrap text-muted-foreground">
                      {formatDateTime(activity.date, locale)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <EnumBadge
                      value={activity.type ?? "call"}
                      label={labelFor(ACTIVITY_TYPES, activity.type ?? "call", translate)}
                    />
                    {activity.deal?.title ? (
                      <span className="text-xs text-muted-foreground">
                        {activity.deal.title}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </DrawerSection>
  );
}
