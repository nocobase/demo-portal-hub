import { useList, useTranslate, useUpdate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { LoadingState } from "@/components/app-shell/loading-state";
import { ListView } from "@/components/resources/views/list-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useChartTheme } from "@/pages/home/theme";
import { cn } from "@/lib/utils";
import {
  DEAL_STAGES,
  OPEN_DEAL_STAGES,
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  labelFor,
} from "../constants";
import { useOpenContextualChild } from "../route-surfaces";
import { useLocale } from "../shared";
import type { DealRecord } from "../types";

const todayIso = () => new Date().toISOString().slice(0, 10);

const stageExists = (stage: string) =>
  DEAL_STAGES.some((item) => item.value === stage);

export function PipelinePage() {
  const translate = useTranslate();
  const locale = useLocale();
  const chart = useChartTheme();
  const openChild = useOpenContextualChild();
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const { mutate: updateDeal } = useUpdate<DealRecord>();

  const { result, query } = useList<DealRecord>({
    resource: "hub_sales_deals",
    pagination: { mode: "server", currentPage: 1, pageSize: 300 },
    meta: { appends: ["account"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const grouped = useMemo(() => {
    const buckets: Record<string, DealRecord[]> = {
      inquiry: [],
      quote: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    for (const deal of result.data) {
      const stage =
        deal.stage && stageExists(deal.stage) ? deal.stage : "inquiry";
      buckets[stage].push(deal);
    }
    const sortByClose = (left: DealRecord, right: DealRecord) =>
      (left.expected_close_date ?? "9999").localeCompare(
        right.expected_close_date ?? "9999"
      );
    Object.values(buckets).forEach((bucket) => bucket.sort(sortByClose));
    return buckets;
  }, [result.data]);

  const stats = useMemo(() => {
    const sum = (deals: DealRecord[]) =>
      deals.reduce((total, deal) => total + Number(deal.amount ?? 0), 0);
    const openDeals = OPEN_DEAL_STAGES.flatMap((stage) => grouped[stage] ?? []);
    const won = grouped.won ?? [];
    const lost = grouped.lost ?? [];
    const decided = won.length + lost.length;
    return {
      pipelineValue: sum(openDeals),
      openCount: openDeals.length,
      wonValue: sum(won),
      winRate: decided === 0 ? 0 : Math.round((won.length / decided) * 100),
    };
  }, [grouped]);

  const chartOption = useMemo(() => {
    const stages = DEAL_STAGES.map((stage) =>
      labelFor(DEAL_STAGES, stage.value, translate)
    );
    const values = DEAL_STAGES.map((stage) =>
      (grouped[stage.value] ?? []).reduce(
        (total, deal) => total + Number(deal.amount ?? 0),
        0
      )
    );
    return {
      color: [chart.palette[0]],
      grid: { left: 6, right: 16, top: 16, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: chart.tooltipBg,
        borderColor: chart.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: chart.tooltipText, fontSize: 12 },
        valueFormatter: (v: number) => formatCurrencyCompact(v, locale),
      },
      xAxis: {
        type: "category",
        data: stages,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: chart.grid } },
        axisLabel: { color: chart.axis, fontSize: 12 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        splitLine: { lineStyle: { color: chart.grid } },
        axisLabel: {
          color: chart.axis,
          fontSize: 12,
          formatter: (v: number) => formatCurrencyCompact(v, locale),
        },
      },
      series: [
        {
          type: "bar",
          data: values.map((value, index) => ({
            value,
            itemStyle: { color: chart.palette[index % chart.palette.length] },
          })),
          barWidth: 30,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }, [grouped, chart, locale, translate]);

  const moveDeal = (deal: DealRecord, stage: string) => {
    if (deal.stage === stage) return;
    updateDeal({ resource: "hub_sales_deals", id: deal.id, values: { stage } });
  };

  return (
    <ListView resource="hub_sales_deals">
      {query.isLoading ? (
        <LoadingState className="min-h-64" />
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {translate(
              "sales.pipeline.loadError.title",
              { ns: "starter" },
              "Unable to load pipeline"
            )}
          </AlertTitle>
          <AlertDescription>
            {translate(
              "sales.pipeline.loadError.description",
              { ns: "starter" },
              "Check your connection and try again."
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          {/* KPI strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label={translate(
                "sales.pipeline.kpi.pipelineValue",
                { ns: "starter" },
                "Pipeline value"
              )}
              value={formatCurrency(stats.pipelineValue, locale)}
              hint={translate(
                "sales.pipeline.kpi.pipelineValue.hint",
                { ns: "starter" },
                "Open deals across active stages"
              )}
            />
            <KpiCard
              label={translate(
                "sales.pipeline.kpi.openDeals",
                { ns: "starter" },
                "Open deals"
              )}
              value={String(stats.openCount)}
              hint={translate(
                "sales.pipeline.kpi.openDeals.hint",
                { ns: "starter" },
                "Inquiry, quote & negotiation"
              )}
            />
            <KpiCard
              label={translate(
                "sales.pipeline.kpi.wonValue",
                { ns: "starter" },
                "Won (value)"
              )}
              value={formatCurrency(stats.wonValue, locale)}
              hint={translate(
                "sales.pipeline.kpi.wonValue.hint",
                { ns: "starter" },
                "Closed-won total"
              )}
            />
            <KpiCard
              label={translate(
                "sales.pipeline.kpi.winRate",
                { ns: "starter" },
                "Win rate"
              )}
              value={`${stats.winRate}%`}
              hint={translate(
                "sales.pipeline.kpi.winRate.hint",
                { ns: "starter" },
                "Won vs decided deals"
              )}
              accent
            />
          </div>

          {/* Value by stage */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-sm font-medium">
                  {translate(
                    "sales.pipeline.chart.title",
                    { ns: "starter" },
                    "Pipeline value by stage"
                  )}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {translate(
                    "sales.pipeline.dealCount",
                    { ns: "starter" },
                    "{{count}} deals"
                  ).replace("{{count}}", String(result.data.length))}
                </span>
              </div>
              <ReactECharts
                key={`stage-${chart.isDark}`}
                option={chartOption}
                style={{ height: 220 }}
                opts={{ renderer: "svg" }}
              />
            </CardContent>
          </Card>

          {/* Kanban board */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {DEAL_STAGES.map((stage) => {
              const deals = grouped[stage.value] ?? [];
              const total = deals.reduce(
                (sum, deal) => sum + Number(deal.amount ?? 0),
                0
              );
              return (
                <div
                  key={stage.value}
                  data-stage={stage.value}
                  className={cn(
                    "flex min-h-72 flex-col rounded-xl border bg-muted/25 transition-colors",
                    dragOverStage === stage.value &&
                      "border-primary/60 bg-primary/5"
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverStage(stage.value);
                  }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOverStage(null);
                    const dealId = event.dataTransfer.getData("text/plain");
                    const deal = result.data.find(
                      (item) => String(item.id) === dealId
                    );
                    if (deal) moveDeal(deal, stage.value);
                  }}
                >
                  <div className="flex items-baseline justify-between border-b px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("size-2 rounded-full", stageDot(stage.value))}
                      />
                      <span className="text-sm font-semibold">
                        {labelFor(DEAL_STAGES, stage.value, translate)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {deals.length}
                      </span>
                    </div>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {formatCurrencyCompact(total, locale)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                    {deals.length === 0 ? (
                      <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                        {translate(
                          "sales.pipeline.emptyColumn",
                          { ns: "starter" },
                          "Drop a deal here"
                        )}
                      </p>
                    ) : (
                      deals.map((deal) => (
                        <PipelineCard
                          key={String(deal.id)}
                          deal={deal}
                          locale={locale}
                          onOpen={() => openChild(`show/${deal.id}`)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ListView>
  );
}

function stageDot(stage: string) {
  switch (stage) {
    case "inquiry":
      return "bg-blue-500";
    case "quote":
      return "bg-cyan-500";
    case "negotiation":
      return "bg-amber-500";
    case "won":
      return "bg-emerald-500";
    case "lost":
      return "bg-red-500";
    default:
      return "bg-muted-foreground";
  }
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {accent ? (
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/12 text-blue-600 dark:text-blue-400">
              <TrendingUp className="size-4" />
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function PipelineCard({
  deal,
  locale,
  onOpen,
}: {
  deal: DealRecord;
  locale: string;
  onOpen: () => void;
}) {
  const translate = useTranslate();
  const isOpen = OPEN_DEAL_STAGES.includes(deal.stage ?? "");
  const isOverdue =
    isOpen &&
    Boolean(deal.expected_close_date) &&
    (deal.expected_close_date as string) < todayIso();

  return (
    <button
      type="button"
      draggable
      onDragStart={(event) =>
        event.dataTransfer.setData("text/plain", String(deal.id))
      }
      onClick={onOpen}
      className="group flex cursor-grab flex-col gap-1.5 rounded-lg border bg-card p-3 text-left shadow-xs transition-shadow hover:shadow-sm active:cursor-grabbing"
    >
      <span className="line-clamp-2 text-sm font-medium">
        {deal.title || "—"}
      </span>
      <span className="text-xs text-muted-foreground">
        {deal.account?.name ||
          translate("sales.pipeline.noAccount", { ns: "starter" }, "No account")}
      </span>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(deal.amount, locale)}
        </span>
        {deal.expected_close_date ? (
          <span
            className={cn(
              "flex items-center gap-1 text-xs tabular-nums",
              isOverdue
                ? "font-medium text-red-600 dark:text-red-400"
                : "text-muted-foreground"
            )}
          >
            {isOverdue ? <AlertTriangle className="size-3" /> : null}
            {formatDate(deal.expected_close_date, locale)}
          </span>
        ) : null}
      </div>
    </button>
  );
}
