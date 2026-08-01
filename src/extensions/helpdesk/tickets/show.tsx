import {
  type HttpError,
  useGetIdentity,
  useGetLocale,
  useList,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Pencil, RotateCw, Send } from "lucide-react";
import { useNavigate, useOutlet, useParams } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { EditButton } from "@/components/resources/buttons/edit";
import { RefreshButton } from "@/components/resources/buttons/refresh";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RouteDrawer } from "@/extensions/nocobase-route-surfaces";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  formatDateTime,
  initialsFor,
  labelFor,
  relativeTime,
} from "../constants";
import { helpdeskRoutes } from "../routes";
import {
  CategoryBadge,
  DetailItems,
  PriorityPill,
  StatusPill,
  userLabel,
} from "../shared";
import type { ReplyRecord, TicketRecord, UserRef } from "../types";

const TICKETS = "hub_hd_tickets";
const REPLIES = "hub_hd_replies";

export const TicketShow = () => {
  const translate = useTranslate();
  const getLocale = useGetLocale();
  const locale = getLocale();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const nestedDrawer = useOutlet();

  const { result: ticket, query } = useShow<TicketRecord>({
    resource: TICKETS,
    id,
    meta: { appends: ["requester", "assignee"] },
  });

  const subject =
    ticket?.subject || (query.isLoading ? "" : "Ticket");

  return (
    <RouteDrawer
      title={
        query.isLoading && !ticket ? (
          <Skeleton className="h-6 w-48" />
        ) : (
          subject
        )
      }
      description="Full history of this support request, with the reply thread."
      closeLabel={translate("buttons.close", "Close")}
      closeTo={helpdeskRoutes.tickets}
      nested={nestedDrawer}
      actions={
        ticket ? (
          <>
            <RefreshButton
              resource={TICKETS}
              recordItemId={ticket.id}
              variant="outline"
              size="icon-sm"
              aria-label={translate("buttons.refresh", "Refresh")}
              title={translate("buttons.refresh", "Refresh")}
            >
              <RotateCw />
            </RefreshButton>
            <EditButton
              resource={TICKETS}
              recordItemId={ticket.id}
              variant="outline"
              size="icon-sm"
              aria-label="Edit ticket"
              title="Edit ticket"
              onClick={() => navigate("edit")}
            >
              <Pencil />
            </EditButton>
          </>
        ) : null
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {query.isLoading ? (
          <LoadingState className="min-h-64" />
        ) : query.isError || !ticket ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load ticket</AlertTitle>
            <AlertDescription>
              The ticket may no longer exist, or you may not have permission to
              view it.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill
                value={ticket.status}
                label={labelFor(TICKET_STATUSES, ticket.status)}
              />
              <PriorityPill
                value={ticket.priority}
                label={labelFor(TICKET_PRIORITIES, ticket.priority)}
              />
              {ticket.category ? (
                <CategoryBadge
                  value={ticket.category}
                  label={labelFor(TICKET_CATEGORIES, ticket.category)}
                />
              ) : null}
            </div>

            {ticket.description ? (
              <p className="text-sm leading-6 text-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No description provided.
              </p>
            )}

            <Separator />

            <DetailItems
              title="Details"
              items={[
                ["Requester", userLabel(ticket.requester)],
                ["Assignee", userLabel(ticket.assignee)],
                ["Opened", formatDateTime(ticket.createdAt, locale)],
                ["Last updated", formatDateTime(ticket.updatedAt, locale)],
              ]}
            />

            <Separator />

            <RepliesThread ticketId={ticket.id} />
          </div>
        )}
      </div>
    </RouteDrawer>
  );
};

// ---------------------------------------------------------------------------
// Replies thread — the sub-table + inline reply composer.
// ---------------------------------------------------------------------------

function RepliesThread({ ticketId }: { ticketId: number | string }) {
  const getLocale = useGetLocale();
  const locale = getLocale();

  const { result, query } = useList<ReplyRecord>({
    resource: REPLIES,
    filters: [{ field: "ticketId", operator: "eq", value: ticketId }],
    sorters: [{ field: "createdAt", order: "asc" }],
    pagination: { mode: "server", currentPage: 1, pageSize: 100 },
    meta: { appends: ["author"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const replies = result.data ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Replies</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {replies.length} {replies.length === 1 ? "message" : "messages"}
        </span>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-3/4" />
        </div>
      ) : replies.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/70 px-3 py-6 text-center text-sm text-muted-foreground">
          No replies yet. Start the conversation below.
        </p>
      ) : (
        <ol className="space-y-3">
          {replies.map((reply) => (
            <li
              key={reply.id}
              className="flex gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
                {initialsFor(userLabel(reply.author as UserRef))}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {userLabel(reply.author as UserRef)}
                  </span>
                  <span
                    className="shrink-0 text-xs text-muted-foreground"
                    title={formatDateTime(reply.createdAt, locale)}
                  >
                    {relativeTime(reply.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-foreground whitespace-pre-wrap">
                  {reply.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <ReplyComposer ticketId={ticketId} />
    </section>
  );
}

type ReplyFormValues = {
  body: string;
  ticketId?: number | string;
  authorId?: number | string | null;
};

function ReplyComposer({ ticketId }: { ticketId: number | string }) {
  const { data: identity } = useGetIdentity<{ id: number | string }>();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<ReplyRecord, HttpError, ReplyFormValues>({
    refineCoreProps: {
      resource: REPLIES,
      action: "create",
      redirect: false,
      onMutationSuccess: () => form.reset({ body: "" }),
    },
    defaultValues: { body: "" },
  });

  const body = form.watch("body");
  const canSend = Boolean(body?.trim()) && !form.formState.isSubmitting;

  const submit = form.handleSubmit((values) => {
    if (!values.body.trim()) return;
    onFinish({
      body: values.body.trim(),
      ticketId,
      authorId: identity?.id ?? null,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-2">
      <Textarea
        {...form.register("body")}
        placeholder="Write a reply..."
        className="min-h-24"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={!canSend}>
          <Send className={cn("size-4", form.formState.isSubmitting && "animate-pulse")} />
          {form.formState.isSubmitting ? "Sending..." : "Send reply"}
        </Button>
      </div>
    </form>
  );
}
