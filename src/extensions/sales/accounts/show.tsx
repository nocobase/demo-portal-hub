import { useList, useShow } from "@refinedev/core";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate, useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  DEAL_STAGES,
  INDUSTRIES,
  formatCurrency,
  formatDate,
  labelFor,
} from "../constants";
import { salesRoutes } from "../routes";
import {
  DetailItems,
  DrawerSection,
  EmptyRow,
  EnumBadge,
  SimpleTable,
  useLocale,
} from "../shared";
import type { AccountRecord, ContactRecord, DealRecord } from "../types";

export function AccountShow() {
  const locale = useLocale();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const nestedDrawer = useOutlet();
  const { result: record, query } = useShow<AccountRecord>({
    resource: "hub_sales_accounts",
    id,
    meta: { appends: ["owner"] },
  });

  const displayName = record?.name || "Unnamed account";

  return (
    <RouteDrawer
      title={
        query.isLoading && !record ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          displayName
        )
      }
      description="Profile, contacts and deals for this account."
      closeLabel="Close"
      closeTo={salesRoutes.accounts}
      nested={nestedDrawer}
      actions={
        record ? (
          <EditButton
            resource="hub_sales_accounts"
            recordItemId={record.id}
            variant="outline"
            size="icon-sm"
            onClick={() => navigate("edit")}
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
            <AlertTitle>Unable to load account</AlertTitle>
            <AlertDescription>
              The account may no longer exist, or you may not have permission to
              view it.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title="Profile"
              items={[
                [
                  "Industry",
                  record?.industry
                    ? labelFor(INDUSTRIES, record.industry)
                    : "—",
                ],
                [
                  "Owner",
                  record?.owner
                    ? record.owner.nickname || record.owner.username || "—"
                    : "—",
                ],
                [
                  "Website",
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
                ["Account since", formatDate(record?.createdAt, locale)],
              ]}
            />
            {id ? (
              <>
                <Separator />
                <ContactsSection accountId={id} navigate={navigate} />
                <Separator />
                <DealsSection
                  accountId={id}
                  locale={locale}
                  navigate={navigate}
                />
              </>
            ) : null}
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}

type Navigate = ReturnType<typeof useNavigate>;

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
  navigate,
}: {
  accountId: string;
  navigate: Navigate;
}) {
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
      title="Contacts"
      action={
        <AddLink
          onClick={() => navigate("contacts/create")}
          label="Add contact"
        />
      }
    >
      <SimpleTable headers={["Name", "Job title", "Email", "Phone", "Actions"]}>
        {result.data.length === 0 ? (
          <EmptyRow colSpan={5} text="No contacts yet." />
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
                      navigate(
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
  navigate,
}: {
  accountId: string;
  locale: string;
  navigate: Navigate;
}) {
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
      title="Deals"
      action={
        <AddLink onClick={() => navigate("deals/create")} label="Add deal" />
      }
    >
      <SimpleTable headers={["Deal", "Stage", "Amount", "Expected close", "Actions"]}>
        {result.data.length === 0 ? (
          <EmptyRow colSpan={5} text="No deals for this account yet." />
        ) : (
          result.data.map((deal) => (
            <tr key={String(deal.id)}>
              <td className="px-3 py-2 font-medium">{deal.title || "—"}</td>
              <td className="px-3 py-2">
                <EnumBadge
                  value={deal.stage ?? "inquiry"}
                  label={labelFor(DEAL_STAGES, deal.stage ?? "inquiry")}
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
                      navigate(
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
