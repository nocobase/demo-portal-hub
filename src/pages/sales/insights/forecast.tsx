import { useList, useTranslate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { Medal } from "lucide-react";
import { useMemo } from "react";
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
  labelFor,
} from "../constants";
import { EmptyRow, SimpleTable, useLocale } from "../shared";
import type { DealRecord } from "../types";

// Funnel stage progression order — every deal (open, won or lost) has passed
// through inquiry; lost deals still count toward earlier stages for the
// purpose of a "how far did deals get" funnel.
const FUNNEL_STAGES = ["inquiry", "quote", "negotiation", "won"] as const;
const FUNNEL_RANK: Record<string, number> = {
  inquiry: 0,
  quote: 1,
  negotiation: 2,
  won: 3,
  lost: 0,
};

export function ForecastPage() {
  const translate = useTranslate();
  const locale = useLocale();
  const chart = useChartTheme();

  const { result, query } = useList<DealRecord>({
    resource: "hub_sales_deals",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    meta: { appends: ["owner", "account"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const stats = useMemo(() => {
    const deals = result.data;
    const won = deals.filter((deal) => deal.stage === "won");
    const lost = deals.filter((deal) => deal.stage === "lost");
    const open = deals.filter((deal) =>
      OPEN_DEAL_STAGES.includes(deal.stage ?? "")
    );
    const decided = won.length + lost.length;
    const sum = (list: DealRecord[]) =>
      list.reduce((total, deal) => total + Number(deal.amount ?? 0), 0);
    return {
      pipelineValue: sum(open),
      wonValue: sum(won),
      winRate: decided === 0 ? 0 : Math.round((won.length / decided) * 100),
      avgDealSize:
        deals.length === 0 ? 0 : sum(deals) / deals.length,
    };
  }, [result.data]);

  const funnelOption = useMemo(() => {
    const stageCounts = FUNNEL_STAGES.map((stage) => {
      const rank = FUNNEL_RANK[stage];
      const count = result.data.filter(
        (deal) => FUNNEL_RANK[deal.stage ?? "inquiry"] >= rank
      ).length;
      return {
        name: labelFor(DEAL_STAGES, stage, translate),
        value: count,
      };
    });
    return {
      color: chart.palette,
      tooltip: {
        trigger: "item",
        backgroundColor: chart.tooltipBg,
        borderColor: chart.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: chart.tooltipText, fontSize: 12 },
        formatter: "{b}: {c} deals",
      },
      series: [
        {
          type: "funnel",
          left: "6%",
          right: "6%",
          top: 10,
          bottom: 10,
          width: "88%",
          minSize: "24%",
          maxSize: "100%",
          gap: 3,
          label: {
            show: true,
            position: "inside",
            color: "#fff",
            fontSize: 12,
            formatter: "{b}\n{c}",
          },
          itemStyle: { borderColor: chart.tooltipBg, borderWidth: 1 },
          data: stageCounts.map((entry, index) => ({
            ...entry,
            itemStyle: { color: chart.palette[index % chart.palette.length] },
          })),
        },
      ],
    };
  }, [result.data, chart, translate]);

  const leaderboard = useMemo(() => {
    const byOwner = new Map<
      string,
      { label: string; open: number; won: number; count: number; decided: number; wonCount: number }
    >();
    for (const deal of result.data) {
      const key = deal.owner ? String(deal.owner.id) : "unassigned";
      const label = deal.owner
        ? deal.owner.nickname || deal.owner.username || `User #${deal.owner.id}`
        : translate("sales.forecast.leaderboard.unassigned", { ns: "starter" }, "Unassigned");
      const entry = byOwner.get(key) ?? {
        label,
        open: 0,
        won: 0,
        count: 0,
        decided: 0,
        wonCount: 0,
      };
      entry.count += 1;
      const amount = Number(deal.amount ?? 0);
      if (OPEN_DEAL_STAGES.includes(deal.stage ?? "")) entry.open += amount;
      if (deal.stage === "won") {
        entry.won += amount;
        entry.decided += 1;
        entry.wonCount += 1;
      } else if (deal.stage === "lost") {
        entry.decided += 1;
      }
      byOwner.set(key, entry);
    }
    return Array.from(byOwner.values())
      .sort((a, b) => b.won - a.won)
      .map((entry) => ({
        ...entry,
        winRate: entry.decided === 0 ? 0 : Math.round((entry.wonCount / entry.decided) * 100),
      }));
  }, [result.data, translate]);

  const maxWon = Math.max(1, ...leaderboard.map((entry) => entry.won));

  return (
    <ListView resource="hub_sales_deals">
      {query.isLoading ? (
        <LoadingState className="min-h-64" />
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {translate(
              "sales.forecast.loadError.title",
              { ns: "starter" },
              "Unable to load forecast"
            )}
          </AlertTitle>
          <AlertDescription>
            {translate(
              "sales.forecast.loadError.description",
              { ns: "starter" },
              "Check your connection and try again."
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label={translate(
                "sales.forecast.kpi.pipelineValue",
                { ns: "starter" },
                "Open pipeline"
              )}
              value={formatCurrency(stats.pipelineValue, locale)}
            />
            <KpiCard
              label={translate(
                "sales.forecast.kpi.wonValue",
                { ns: "starter" },
                "Won (all time)"
              )}
              value={formatCurrency(stats.wonValue, locale)}
            />
            <KpiCard
              label={translate(
                "sales.forecast.kpi.winRate",
                { ns: "starter" },
                "Win rate"
              )}
              value={`${stats.winRate}%`}
            />
            <KpiCard
              label={translate(
                "sales.forecast.kpi.avgDealSize",
                { ns: "starter" },
                "Avg deal size"
              )}
              value={formatCurrency(stats.avgDealSize, locale)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <Card className="xl:col-span-2">
              <CardContent className="pt-6">
                <h3 className="mb-2 text-sm font-medium">
                  {translate(
                    "sales.forecast.funnel.title",
                    { ns: "starter" },
                    "Conversion funnel"
                  )}
                </h3>
                <ReactECharts
                  key={`funnel-${chart.isDark}`}
                  option={funnelOption}
                  style={{ height: 260 }}
                  opts={{ renderer: "svg" }}
                />
              </CardContent>
            </Card>

            <Card className="xl:col-span-3">
              <CardContent className="pt-6">
                <h3 className="mb-3 text-sm font-medium">
                  {translate(
                    "sales.forecast.leaderboard.title",
                    { ns: "starter" },
                    "Owner leaderboard"
                  )}
                </h3>
                <SimpleTable
                  headers={[
                    "#",
                    translate(
                      "sales.forecast.leaderboard.owner",
                      { ns: "starter" },
                      "Owner"
                    ),
                    translate(
                      "sales.forecast.leaderboard.wonValue",
                      { ns: "starter" },
                      "Won"
                    ),
                    translate(
                      "sales.forecast.leaderboard.winRate",
                      { ns: "starter" },
                      "Win rate"
                    ),
                    translate(
                      "sales.forecast.leaderboard.deals",
                      { ns: "starter" },
                      "Deals"
                    ),
                  ]}
                >
                  {leaderboard.length === 0 ? (
                    <EmptyRow
                      colSpan={5}
                      text={translate(
                        "sales.forecast.leaderboard.empty",
                        { ns: "starter" },
                        "No deals yet."
                      )}
                    />
                  ) : (
                    leaderboard.map((entry, index) => (
                      <tr key={entry.label}>
                        <td className="px-3 py-2 text-muted-foreground">
                          {index < 3 ? (
                            <Medal
                              className={cn(
                                "size-4",
                                index === 0 && "text-amber-500",
                                index === 1 && "text-slate-400",
                                index === 2 && "text-orange-700"
                              )}
                            />
                          ) : (
                            index + 1
                          )}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          <div className="flex flex-col gap-1">
                            <span>{entry.label}</span>
                            <div className="h-1.5 w-full max-w-32 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.max(4, Math.round((entry.won / maxWon) * 100))}%`,
                                  backgroundColor: chart.palette[0],
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {formatCurrencyCompact(entry.won, locale)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">{entry.winRate}%</td>
                        <td className="px-3 py-2 tabular-nums">{entry.count}</td>
                      </tr>
                    ))
                  )}
                </SimpleTable>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ListView>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
