import { useShow, useTranslate } from "@refinedev/core";
import { Building2, Pencil } from "lucide-react";
import { useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import { formatDate } from "../constants";
import {
  useContextualCloseTo,
  useOpenContextualChild,
} from "../route-surfaces";
import { DetailItems, useLocale } from "../shared";
import type { ContactRecord } from "../types";

export function ContactShow() {
  const translate = useTranslate();
  const locale = useLocale();
  const openChild = useOpenContextualChild();
  const closeTo = useContextualCloseTo();
  const { id } = useParams<{ id: string }>();
  const nestedDrawer = useOutlet();
  const { result: record, query } = useShow<ContactRecord>({
    resource: "hub_sales_contacts",
    id,
    meta: { appends: ["account"] },
  });

  const displayName =
    record?.name ||
    translate("sales.contacts.detail.unnamed", { ns: "starter" }, "Unnamed contact");

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
        "sales.contacts.drawer.show.description",
        { ns: "starter" },
        "Contact details and the account they belong to."
      )}
      closeLabel={translate("sales.common.close", { ns: "starter" }, "Close")}
      closeTo={closeTo}
      nested={nestedDrawer}
      actions={
        record ? (
          <EditButton
            resource="hub_sales_contacts"
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
                "sales.contacts.detail.loadError.title",
                { ns: "starter" },
                "Unable to load contact"
              )}
            </AlertTitle>
            <AlertDescription>
              {translate(
                "sales.contacts.detail.loadError.description",
                { ns: "starter" },
                "The contact may no longer exist, or you may not have permission to view it."
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <DetailItems
              title={translate(
                "sales.contacts.detail.profile",
                { ns: "starter" },
                "Contact info"
              )}
              items={[
                [
                  translate(
                    "sales.contacts.fields.jobTitle",
                    { ns: "starter" },
                    "Job title"
                  ),
                  record?.title || "—",
                ],
                [
                  translate(
                    "sales.contacts.fields.email",
                    { ns: "starter" },
                    "Email"
                  ),
                  record?.email ? (
                    <a
                      key="email"
                      href={`mailto:${record.email}`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {record.email}
                    </a>
                  ) : (
                    "—"
                  ),
                ],
                [
                  translate(
                    "sales.contacts.fields.phone",
                    { ns: "starter" },
                    "Phone"
                  ),
                  record?.phone || "—",
                ],
                [
                  translate(
                    "sales.contacts.detail.contactSince",
                    { ns: "starter" },
                    "Contact since"
                  ),
                  formatDate(record?.createdAt, locale),
                ],
              ]}
            />
            <section className="space-y-3">
              <h3 className="text-sm font-medium">
                {translate(
                  "sales.contacts.detail.account",
                  { ns: "starter" },
                  "Account"
                )}
              </h3>
              {record?.account?.name ? (
                <Button
                  variant="outline"
                  className="h-auto justify-start gap-2 py-2"
                  onClick={() =>
                    openChild(`/accounts/show/${record.account?.id}`)
                  }
                >
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {record.account.name}
                    </span>
                    {record.account.industry ? (
                      <span className="text-xs text-muted-foreground">
                        {record.account.industry}
                      </span>
                    ) : null}
                  </span>
                </Button>
              ) : (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  {translate(
                    "sales.contacts.detail.noAccount",
                    { ns: "starter" },
                    "This contact is not linked to an account."
                  )}
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </RouteDrawer>
  );
}
