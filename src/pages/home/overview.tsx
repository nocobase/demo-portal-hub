import { useTranslate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Boxes,
  CheckCircle2,
  DollarSign,
  FolderKanban,
  LifeBuoy,
  Package,
  ShoppingCart,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartTheme } from "./theme";

// ---------------------------------------------------------------------------
// Demo data — representative, in-file. Real cross-module aggregation is wired
// later; this page is the visual style anchor for the whole suite. All labels
// resolve through i18n keys (see locale.ts); only raw values live here.
// ---------------------------------------------------------------------------

type Kpi = {
  labelKey: string;
  value: string;
  delta: number;
  hintKey: string;
  spark: number[];
  positiveIsGood?: boolean;
};

const KPIS: Kpi[] = [
  {
    labelKey: "home.kpi.revenue.label",
    value: "$284.6k",
    delta: 12.4,
    hintKey: "home.kpi.revenue.hint",
    spark: [18, 22, 20, 27, 25, 31, 29, 36],
  },
  {
    labelKey: "home.kpi.openDeals.label",
    value: "47",
    delta: 8.2,
    hintKey: "home.kpi.openDeals.hint",
    spark: [30, 32, 31, 35, 38, 40, 44, 47],
  },
  {
    labelKey: "home.kpi.activeProjects.label",
    value: "18",
    delta: 5.6,
    hintKey: "home.kpi.activeProjects.hint",
    spark: [12, 13, 14, 14, 16, 16, 17, 18],
  },
  {
    labelKey: "home.kpi.openTickets.label",
    value: "23",
    delta: -14.2,
    hintKey: "home.kpi.openTickets.hint",
    spark: [41, 38, 36, 33, 30, 28, 25, 23],
    positiveIsGood: false,
  },
];

const REVENUE_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const REVENUE_ACTUAL = [186, 205, 198, 231, 224, 258, 270, 285];
const REVENUE_TARGET = [200, 210, 215, 225, 235, 245, 260, 275];

const WORKLOAD = [
  { nameKey: "home.workload.sales", value: 34 },
  { nameKey: "home.workload.projects", value: 26 },
  { nameKey: "home.workload.helpdesk", value: 18 },
  { nameKey: "home.workload.hr", value: 12 },
  { nameKey: "home.workload.procurement", value: 10 },
];

const TREND_WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
const TREND_CREATED = [42, 38, 51, 47, 60, 54, 66, 71];
const TREND_COMPLETED = [30, 41, 44, 49, 52, 58, 61, 68];

type Activity = {
  icon: LucideIcon;
  tone: string;
  textKey: string;
  nameKey: string;
  metaKey: string;
  timeKey: string;
};

const ACTIVITY: Activity[] = [
  {
    icon: DollarSign,
    tone: "text-emerald-600 bg-emerald-500/12 dark:text-emerald-400",
    textKey: "home.activity.dealWon.text",
    nameKey: "home.activity.dealWon.name",
    metaKey: "home.activity.dealWon.meta",
    timeKey: "home.time.12m",
  },
  {
    icon: UserPlus,
    tone: "text-blue-600 bg-blue-500/12 dark:text-blue-400",
    textKey: "home.activity.newHire.text",
    nameKey: "home.activity.newHire.name",
    metaKey: "home.activity.newHire.meta",
    timeKey: "home.time.1h",
  },
  {
    icon: LifeBuoy,
    tone: "text-amber-600 bg-amber-500/12 dark:text-amber-400",
    textKey: "home.activity.ticket.text",
    nameKey: "home.activity.ticket.name",
    metaKey: "home.activity.ticket.meta",
    timeKey: "home.time.2h",
  },
  {
    icon: CheckCircle2,
    tone: "text-teal-600 bg-teal-500/12 dark:text-teal-400",
    textKey: "home.activity.milestone.text",
    nameKey: "home.activity.milestone.name",
    metaKey: "home.activity.milestone.meta",
    timeKey: "home.time.4h",
  },
  {
    icon: ShoppingCart,
    tone: "text-violet-600 bg-violet-500/12 dark:text-violet-400",
    textKey: "home.activity.po.text",
    nameKey: "home.activity.po.name",
    metaKey: "home.activity.po.meta",
    timeKey: "home.time.yesterday",
  },
  {
    icon: Boxes,
    tone: "text-sky-600 bg-sky-500/12 dark:text-sky-400",
    textKey: "home.activity.stock.text",
    nameKey: "home.activity.stock.name",
    metaKey: "home.activity.stock.meta",
    timeKey: "home.time.yesterday",
  },
];

type ModuleLink = {
  labelKey: string;
  descKey: string;
  to: string;
  icon: LucideIcon;
  color: string;
};

const MODULES: ModuleLink[] = [
  { labelKey: "home.modules.sales.label", descKey: "home.modules.sales.desc", to: "/deals", icon: BarChart3, color: "text-blue-600 bg-blue-500/12 dark:text-blue-400" },
  { labelKey: "home.modules.projects.label", descKey: "home.modules.projects.desc", to: "/projects", icon: FolderKanban, color: "text-sky-600 bg-sky-500/12 dark:text-sky-400" },
  { labelKey: "home.modules.hr.label", descKey: "home.modules.hr.desc", to: "/employees", icon: Users, color: "text-teal-600 bg-teal-500/12 dark:text-teal-400" },
  { labelKey: "home.modules.inventory.label", descKey: "home.modules.inventory.desc", to: "/products", icon: Boxes, color: "text-amber-600 bg-amber-500/12 dark:text-amber-400" },
  { labelKey: "home.modules.procurement.label", descKey: "home.modules.procurement.desc", to: "/purchase-orders", icon: ShoppingCart, color: "text-violet-600 bg-violet-500/12 dark:text-violet-400" },
  { labelKey: "home.modules.helpdesk.label", descKey: "home.modules.helpdesk.desc", to: "/tickets", icon: LifeBuoy, color: "text-rose-600 bg-rose-500/12 dark:text-rose-400" },
  { labelKey: "home.modules.assets.label", descKey: "home.modules.assets.desc", to: "/asset-registry", icon: Package, color: "text-indigo-600 bg-indigo-500/12 dark:text-indigo-400" },
  { labelKey: "home.modules.finance.label", descKey: "home.modules.finance.desc", to: "/invoices", icon: DollarSign, color: "text-emerald-600 bg-emerald-500/12 dark:text-emerald-400" },
  { labelKey: "home.modules.knowledge.label", descKey: "home.modules.knowledge.desc", to: "/articles", icon: BookOpen, color: "text-cyan-600 bg-cyan-500/12 dark:text-cyan-400" },
];

// ---------------------------------------------------------------------------

export function OverviewPage() {
  const translate = useTranslate();
  const chart = useChartTheme();

  const axisBase = {
    axisLine: { lineStyle: { color: chart.grid } },
    axisTick: { show: false },
    axisLabel: { color: chart.axis, fontSize: 12 },
  };
  const tooltipBase = {
    backgroundColor: chart.tooltipBg,
    borderColor: chart.tooltipBorder,
    textStyle: { color: chart.tooltipText, fontSize: 12 },
    borderWidth: 1,
    padding: [8, 12],
  };

  const revenueOption = {
    color: [chart.palette[0], chart.palette[1]],
    grid: { left: 6, right: 12, top: 28, bottom: 8, containLabel: true },
    legend: {
      right: 0,
      top: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: chart.axis, fontSize: 12 },
    },
    tooltip: {
      trigger: "axis",
      ...tooltipBase,
      valueFormatter: (v: number) => `$${v}k`,
    },
    xAxis: { type: "category", data: REVENUE_MONTHS, ...axisBase },
    yAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
      axisLabel: { color: chart.axis, fontSize: 12, formatter: "${value}k" },
    },
    series: [
      {
        name: translate("home.series.revenue", "Revenue"),
        type: "bar",
        data: REVENUE_ACTUAL,
        barWidth: 14,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      {
        name: translate("home.series.target", "Target"),
        type: "bar",
        data: REVENUE_TARGET,
        barWidth: 14,
        itemStyle: { borderRadius: [4, 4, 0, 0], opacity: 0.35 },
      },
    ],
  };

  const workloadOption = {
    color: chart.palette,
    tooltip: { trigger: "item", ...tooltipBase, valueFormatter: (v: number) => `${v}%` },
    legend: {
      orient: "vertical",
      right: 0,
      top: "center",
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 12,
      textStyle: { color: chart.axis, fontSize: 12 },
    },
    series: [
      {
        type: "pie",
        radius: ["58%", "82%"],
        center: ["34%", "50%"],
        avoidLabelOverlap: false,
        padAngle: 2,
        itemStyle: { borderRadius: 6 },
        label: { show: false },
        labelLine: { show: false },
        data: WORKLOAD.map((w) => ({
          name: translate(w.nameKey),
          value: w.value,
        })),
      },
    ],
  };

  const trendOption = {
    color: [chart.palette[0], chart.palette[2]],
    grid: { left: 6, right: 12, top: 28, bottom: 8, containLabel: true },
    legend: {
      right: 0,
      top: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: chart.axis, fontSize: 12 },
    },
    tooltip: { trigger: "axis", ...tooltipBase },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: TREND_WEEKS,
      ...axisBase,
    },
    yAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
    },
    series: [
      {
        name: translate("home.series.created", "Created"),
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        data: TREND_CREATED,
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexA(chart.palette[0], 0.28) },
              { offset: 1, color: hexA(chart.palette[0], 0) },
            ],
          },
        },
      },
      {
        name: translate("home.series.completed", "Completed"),
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        data: TREND_COMPLETED,
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexA(chart.palette[2], 0.24) },
              { offset: 1, color: hexA(chart.palette[2], 0) },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">
          {translate("home.overview.title", "Overview")}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {translate(
            "home.overview.description",
            "A live pulse across the whole company — sales, delivery, people and support in one place."
          )}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.labelKey} kpi={kpi} stroke={chart.palette[0]} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>
              {translate("home.chart.revenue.title", "Revenue vs target")}
            </CardTitle>
            <CardDescription>
              {translate(
                "home.chart.revenue.subtitle",
                "Monthly recognized revenue against plan."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              key={`rev-${chart.isDark}`}
              option={revenueOption}
              style={{ height: 288 }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {translate("home.chart.workload.title", "Workload by area")}
            </CardTitle>
            <CardDescription>
              {translate(
                "home.chart.workload.subtitle",
                "Share of active items across teams."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              key={`wl-${chart.isDark}`}
              option={workloadOption}
              style={{ height: 288 }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Trend + activity row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>
              {translate("home.chart.throughput.title", "Throughput")}
            </CardTitle>
            <CardDescription>
              {translate(
                "home.chart.throughput.subtitle",
                "Items created vs completed over the last 8 weeks."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              key={`tr-${chart.isDark}`}
              option={trendOption}
              style={{ height: 280 }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {translate("home.chart.activity.title", "Recent activity")}
            </CardTitle>
            <CardDescription>
              {translate(
                "home.chart.activity.subtitle",
                "The latest across every module."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {ACTIVITY.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-accent/60"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                        item.tone
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-5 text-foreground [&_b]:font-semibold">
                        <ActivityText
                          template={translate(item.textKey)}
                          name={translate(item.nameKey)}
                        />
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {translate(item.metaKey)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {translate(item.timeKey)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module quick links */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            {translate("home.modules.heading", "Modules")}
          </h3>
          <span className="text-xs text-muted-foreground">
            {translate("home.modules.hint", "Jump into any part of the hub")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.labelKey}
                to={mod.to}
                className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-colors hover:border-primary/40 hover:bg-accent/50"
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    mod.color
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {translate(mod.labelKey)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {translate(mod.descKey)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

/**
 * Renders an activity line whose i18n template contains a `{{name}}`
 * placeholder, injecting the (bold) entity name at the right spot so word
 * order stays correct in every language.
 */
function ActivityText({
  template,
  name,
}: {
  template: string;
  name: ReactNode;
}) {
  const parts = template.split("{{name}}");
  return (
    <>
      {parts[0]}
      <b>{name}</b>
      {parts.slice(1).join("{{name}}")}
    </>
  );
}

function KpiCard({ kpi, stroke }: { kpi: Kpi; stroke: string }) {
  const translate = useTranslate();
  const positiveIsGood = kpi.positiveIsGood ?? true;
  const isUp = kpi.delta >= 0;
  const good = isUp === positiveIsGood;

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{translate(kpi.labelKey)}</p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="text-3xl font-semibold tabular-nums tracking-tight">
            {kpi.value}
          </p>
          <Sparkline points={kpi.spark} stroke={stroke} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
              good
                ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                : "bg-red-500/12 text-red-700 dark:text-red-400"
            )}
          >
            {isUp ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(kpi.delta)}%
          </span>
          <span className="text-xs text-muted-foreground">
            {translate(kpi.hintKey)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function Sparkline({ points, stroke }: { points: number[]; stroke: string }) {
  const width = 76;
  const height = 30;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return [x, y] as const;
  });
  const line = coords
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const gradId = `spark-${stroke.replace("#", "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Append an alpha channel to a #rrggbb hex for ECharts gradient stops. */
function hexA(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}
