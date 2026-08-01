import { useList, useTranslate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import {
  CheckCircle2,
  Inbox,
  MessageSquare,
  Plus,
  TriangleAlert,
} from "lucide-react";
import { useMemo } from "react";
import { Link, Outlet } from "react-router";
import { AccessDenied } from "@/components/access-control/access-denied";
import { CanAccess } from "@/components/access-control/can-access";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartTheme } from "@/pages/home/theme";
import {
  BOARD_COLUMNS,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  labelFor,
  statusClassFor,
} from "../constants";
import { getTicketShowPath, helpdeskRoutes } from "../routes";
import { CategoryBadge, PriorityPill, UserChip } from "../shared";
import type { TicketRecord } from "../types";

const RESOURCE = "hub_hd_tickets";
const OPEN_STATUSES = new Set(["open", "pending"]);

export function TicketsLayout() {
  return (
    <>
      <CanAccess resource={RESOURCE} action="list" fallback={<AccessDenied />}>
        <TicketBoard />
      </CanAccess>
      <Outlet />
    </>
  );
}

function TicketBoard() {
  const translate = useTranslate();
  const chart = useChartTheme();

  const { result, query } = useList<TicketRecord>({
    resource: RESOURCE,
    pagination: { mode: "server", currentPage: 1, pageSize: 200 },
    sorters: [{ field: "createdAt", order: "desc" }],
    meta: { appends: ["requester", "assignee", "replies"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const tickets = result.data ?? [];

  const stats = useMemo(() => {
    const open = tickets.filter((t) => OPEN_STATUSES.has(t.status ?? ""));
    const escalated = open.filter((t) =>
      ["high", "urgent"].includes(t.priority ?? "")
    );
    const closed = tickets.filter((t) =>
      ["resolved", "closed"].includes(t.status ?? "")
    );
    const replies = tickets.reduce(
      (sum, t) => sum + (t.replies?.length ?? 0),
      0
    );
    const resolutionRate = tickets.length
      ? Math.round((closed.length / tickets.length) * 100)
      : 0;
    const byPriority = TICKET_PRIORITIES.map(
      (p) => open.filter((t) => t.priority === p.value).length
    );
    return {
      openCount: open.length,
      escalated: escalated.length,
      resolvedCount: closed.length,
      replies,
      resolutionRate,
      byPriority,
    };
  }, [tickets]);

  const grouped = useMemo(() => {
    const map = new Map<string, TicketRecord[]>();
    for (const column of BOARD_COLUMNS) map.set(column.value, []);
    for (const ticket of tickets) {
      const bucket = map.get(ticket.status ?? "");
      if (bucket) bucket.push(ticket);
      else map.set(ticket.status ?? "other", [ticket]);
    }
    return map;
  }, [tickets]);

  const priorityOption = {
    color: [chart.palette[0]],
    grid: { left: 0, right: 16, top: 6, bottom: 0, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: chart.tooltipBg,
      borderColor: chart.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: chart.tooltipText, fontSize: 12 },
      padding: [6, 10],
    },
    xAxis: {
      type: "value",
      splitLine: { lineStyle: { color: chart.grid } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: chart.axis, fontSize: 11 },
      minInterval: 1,
    },
    yAxis: {
      type: "category",
      data: TICKET_PRIORITIES.map((p) => labelFor(TICKET_PRIORITIES, p.value, translate)),
      axisLine: { lineStyle: { color: chart.grid } },
      axisTick: { show: false },
      axisLabel: { color: chart.axis, fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        data: stats.byPriority,
        barWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {translate("helpdesk.board.title", { ns: "starter" }, "Helpdesk")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {translate(
                "helpdesk.board.subtitle",
                { ns: "starter" },
                "Every support request from open to closed, with priorities, owners and the full reply thread."
              )}
            </p>
          </div>
          <Button render={<Link to={helpdeskRoutes.ticketsCreate} />}>
            <Plus className="size-4" />
            {translate("helpdesk.board.newTicket", { ns: "starter" }, "New ticket")}
          </Button>
        </div>
      </div>

      {/* KPI + chart row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatTile
          icon={Inbox}
          tone="text-blue-600 bg-blue-500/12 dark:text-blue-400"
          label={translate("helpdesk.kpi.open.label", { ns: "starter" }, "Open tickets")}
          value={stats.openCount}
          hint={translate("helpdesk.kpi.open.hint", { ns: "starter" }, "Open + pending")}
        />
        <StatTile
          icon={TriangleAlert}
          tone="text-amber-600 bg-amber-500/12 dark:text-amber-400"
          label={translate("helpdesk.kpi.attention.label", { ns: "starter" }, "Needs attention")}
          value={stats.escalated}
          hint={translate(
            "helpdesk.kpi.attention.hint",
            { ns: "starter" },
            "High / urgent, still open"
          )}
        />
        <StatTile
          icon={CheckCircle2}
          tone="text-emerald-600 bg-emerald-500/12 dark:text-emerald-400"
          label={translate("helpdesk.kpi.resolution.label", { ns: "starter" }, "Resolution rate")}
          value={`${stats.resolutionRate}%`}
          hint={translate(
            "helpdesk.kpi.resolution.hint",
            { ns: "starter", count: stats.resolvedCount },
            `${stats.resolvedCount} resolved / closed`
          )}
        />
        <StatTile
          icon={MessageSquare}
          tone="text-teal-600 bg-teal-500/12 dark:text-teal-400"
          label={translate("helpdesk.kpi.replies.label", { ns: "starter" }, "Total replies")}
          value={stats.replies}
          hint={translate("helpdesk.kpi.replies.hint", { ns: "starter" }, "Across all tickets")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {translate("helpdesk.chart.priority.title", { ns: "starter" }, "Open tickets by priority")}
          </CardTitle>
          <CardDescription>
            {translate(
              "helpdesk.chart.priority.description",
              { ns: "starter" },
              "Where the pressure sits right now across open and pending work."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReactECharts
            key={`prio-${chart.isDark}`}
            option={priorityOption}
            style={{ height: 180 }}
            opts={{ renderer: "svg" }}
            showLoading={query.isLoading}
          />
        </CardContent>
      </Card>

      {/* Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {BOARD_COLUMNS.map((column) => {
          const items = grouped.get(column.value) ?? [];
          return (
            <div
              key={column.value}
              className="flex min-h-40 flex-col gap-3 rounded-xl border border-border/70 bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
                      statusClassFor(column.value)
                    )}
                  >
                    {labelFor(BOARD_COLUMNS, column.value, translate)}
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {items.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {query.isLoading ? (
                  <ColumnSkeleton />
                ) : items.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                    {translate("helpdesk.board.emptyColumn", { ns: "starter" }, "Nothing here")}
                  </p>
                ) : (
                  items.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketRecord }) {
  const translate = useTranslate();
  const replyCount = ticket.replies?.length ?? 0;
  return (
    <Link
      to={getTicketShowPath(ticket.id)}
      className="group flex flex-col gap-2 rounded-lg border border-border/70 bg-card p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <p className="line-clamp-2 text-sm font-medium leading-5 text-foreground">
        {ticket.subject ||
          translate("helpdesk.board.untitled", { ns: "starter" }, "Untitled ticket")}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <PriorityPill
          value={ticket.priority}
          label={labelFor(TICKET_PRIORITIES, ticket.priority, translate)}
        />
        {ticket.category ? (
          <CategoryBadge
            value={ticket.category}
            label={labelFor(TICKET_CATEGORIES, ticket.category, translate)}
          />
        ) : null}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <UserChip user={ticket.assignee} />
        {replyCount > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
            <MessageSquare className="size-3.5" />
            {replyCount}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: typeof Inbox;
  tone: string;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {value}
            </p>
          </div>
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              tone
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function ColumnSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-lg border border-border/70 bg-card"
        />
      ))}
    </div>
  );
}
