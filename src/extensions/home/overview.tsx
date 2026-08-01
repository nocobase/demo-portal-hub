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
// later; this page is the visual style anchor for the whole suite.
// ---------------------------------------------------------------------------

type Kpi = {
  label: string;
  value: string;
  delta: number;
  hint: string;
  spark: number[];
  positiveIsGood?: boolean;
};

const KPIS: Kpi[] = [
  {
    label: "Revenue (MTD)",
    value: "$284.6k",
    delta: 12.4,
    hint: "vs last month",
    spark: [18, 22, 20, 27, 25, 31, 29, 36],
  },
  {
    label: "Open deals",
    value: "47",
    delta: 8.2,
    hint: "$1.9M pipeline",
    spark: [30, 32, 31, 35, 38, 40, 44, 47],
  },
  {
    label: "Active projects",
    value: "18",
    delta: 5.6,
    hint: "3 launching this week",
    spark: [12, 13, 14, 14, 16, 16, 17, 18],
  },
  {
    label: "Open tickets",
    value: "23",
    delta: -14.2,
    hint: "SLA on track",
    spark: [41, 38, 36, 33, 30, 28, 25, 23],
    positiveIsGood: false,
  },
];

const REVENUE_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const REVENUE_ACTUAL = [186, 205, 198, 231, 224, 258, 270, 285];
const REVENUE_TARGET = [200, 210, 215, 225, 235, 245, 260, 275];

const WORKLOAD = [
  { name: "Sales", value: 34 },
  { name: "Projects", value: 26 },
  { name: "Helpdesk", value: 18 },
  { name: "HR", value: 12 },
  { name: "Procurement", value: 10 },
];

const TREND_WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
const TREND_CREATED = [42, 38, 51, 47, 60, 54, 66, 71];
const TREND_COMPLETED = [30, 41, 44, 49, 52, 58, 61, 68];

type Activity = {
  icon: LucideIcon;
  tone: string;
  text: ReactNode;
  meta: string;
  time: string;
};

const ACTIVITY: Activity[] = [
  {
    icon: DollarSign,
    tone: "text-emerald-600 bg-emerald-500/12 dark:text-emerald-400",
    text: (
      <>
        Deal <b>Acme Corp — Q3 Rollout</b> marked won
      </>
    ),
    meta: "Sales · $86,000",
    time: "12m ago",
  },
  {
    icon: UserPlus,
    tone: "text-blue-600 bg-blue-500/12 dark:text-blue-400",
    text: (
      <>
        <b>Dana Whitfield</b> joined the Design team
      </>
    ),
    meta: "HR · Onboarding",
    time: "1h ago",
  },
  {
    icon: LifeBuoy,
    tone: "text-amber-600 bg-amber-500/12 dark:text-amber-400",
    text: (
      <>
        Ticket <b>#4821</b> escalated to priority high
      </>
    ),
    meta: "Helpdesk · Billing",
    time: "2h ago",
  },
  {
    icon: CheckCircle2,
    tone: "text-teal-600 bg-teal-500/12 dark:text-teal-400",
    text: (
      <>
        Milestone <b>Beta Launch</b> completed
      </>
    ),
    meta: "Projects · Phoenix",
    time: "4h ago",
  },
  {
    icon: ShoppingCart,
    tone: "text-violet-600 bg-violet-500/12 dark:text-violet-400",
    text: (
      <>
        PO <b>PO-2049</b> approved for Northwind Supply
      </>
    ),
    meta: "Procurement · $14,200",
    time: "Yesterday",
  },
  {
    icon: Boxes,
    tone: "text-sky-600 bg-sky-500/12 dark:text-sky-400",
    text: (
      <>
        Stock received — <b>120 units</b> of SKU-8830
      </>
    ),
    meta: "Inventory · Warehouse B",
    time: "Yesterday",
  },
];

type ModuleLink = {
  label: string;
  desc: string;
  to: string;
  icon: LucideIcon;
  color: string;
};

const MODULES: ModuleLink[] = [
  { label: "Sales", desc: "Leads, accounts & pipeline", to: "/deals", icon: BarChart3, color: "text-blue-600 bg-blue-500/12 dark:text-blue-400" },
  { label: "Projects", desc: "Tasks, boards & milestones", to: "/projects", icon: FolderKanban, color: "text-sky-600 bg-sky-500/12 dark:text-sky-400" },
  { label: "HR", desc: "People, teams & leave", to: "/employees", icon: Users, color: "text-teal-600 bg-teal-500/12 dark:text-teal-400" },
  { label: "Inventory", desc: "Products & stock moves", to: "/products", icon: Boxes, color: "text-amber-600 bg-amber-500/12 dark:text-amber-400" },
  { label: "Procurement", desc: "Suppliers & purchase orders", to: "/purchase-orders", icon: ShoppingCart, color: "text-violet-600 bg-violet-500/12 dark:text-violet-400" },
  { label: "Helpdesk", desc: "Tickets & replies", to: "/tickets", icon: LifeBuoy, color: "text-rose-600 bg-rose-500/12 dark:text-rose-400" },
  { label: "Assets", desc: "Devices & assignments", to: "/asset-registry", icon: Package, color: "text-indigo-600 bg-indigo-500/12 dark:text-indigo-400" },
  { label: "Finance", desc: "Expenses & invoices", to: "/invoices", icon: DollarSign, color: "text-emerald-600 bg-emerald-500/12 dark:text-emerald-400" },
  { label: "Knowledge", desc: "Docs & articles", to: "/articles", icon: BookOpen, color: "text-cyan-600 bg-cyan-500/12 dark:text-cyan-400" },
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
        name: "Revenue",
        type: "bar",
        data: REVENUE_ACTUAL,
        barWidth: 14,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Target",
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
        data: WORKLOAD,
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
        name: "Created",
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
        name: "Completed",
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
          <KpiCard key={kpi.label} kpi={kpi} stroke={chart.palette[0]} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs target</CardTitle>
            <CardDescription>Monthly recognized revenue against plan.</CardDescription>
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
            <CardTitle>Workload by area</CardTitle>
            <CardDescription>Share of active items across teams.</CardDescription>
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
            <CardTitle>Throughput</CardTitle>
            <CardDescription>Items created vs completed over the last 8 weeks.</CardDescription>
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
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>The latest across every module.</CardDescription>
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
                        {item.text}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.meta}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {item.time}
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
          <h3 className="text-lg font-semibold tracking-tight">Modules</h3>
          <span className="text-xs text-muted-foreground">
            Jump into any part of the hub
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.label}
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
                    {mod.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {mod.desc}
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

function KpiCard({ kpi, stroke }: { kpi: Kpi; stroke: string }) {
  const positiveIsGood = kpi.positiveIsGood ?? true;
  const isUp = kpi.delta >= 0;
  const good = isUp === positiveIsGood;

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{kpi.label}</p>
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
          <span className="text-xs text-muted-foreground">{kpi.hint}</span>
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
