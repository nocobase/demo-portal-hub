import { useList, useTranslate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { BarChart3, DollarSign, PackageCheck, ReceiptText } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChartTheme } from "@/pages/home/theme";
import { PO_STATUSES, formatCurrency, labelFor } from "./constants";
import { getSupplierShowPath } from "./routes";
import { useLocale } from "./shared";
import type { PurchaseOrderRecord } from "./types";

const MONTHS_BACK = 6;

function hexA(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function monthKey(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function lastMonths(count: number) {
  const now = new Date();
  const months: { key: string; date: Date }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      date,
    });
  }
  return months;
}

export function SpendAnalysisDashboard() {
  const translate = useTranslate();
  const locale = useLocale();
  const chart = useChartTheme();
  const navigate = useNavigate();

  const { result, query } = useList<PurchaseOrderRecord>({
    resource: "hub_po_purchase_orders",
    pagination: { mode: "server", currentPage: 1, pageSize: 1000 },
    meta: { appends: ["supplier"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const loading = query.isLoading;
  const orders = result.data;

  const unassigned = translate(
    "procurement.spend.unassigned",
    { ns: "starter" },
    "Unassigned"
  );

  const {
    kpis,
    bySupplier,
    byStatus,
    trend,
    topSuppliers,
  } = useMemo(() => {
    const committed = orders.filter((po) => po.status !== "cancelled");
    const totalCommitted = committed.reduce(
      (sum, po) => sum + Number(po.total ?? 0),
      0
    );
    const received = orders.filter((po) => po.status === "received");
    const receivedValue = received.reduce(
      (sum, po) => sum + Number(po.total ?? 0),
      0
    );
    const avgOrder = committed.length ? totalCommitted / committed.length : 0;

    const spendMap = new Map<
      string,
      { value: number; count: number; supplierId: string | number | null }
    >();
    for (const po of committed) {
      const name = po.supplier?.name || unassigned;
      const entry = spendMap.get(name) ?? {
        value: 0,
        count: 0,
        supplierId: po.supplier_id ?? null,
      };
      entry.value += Number(po.total ?? 0);
      entry.count += 1;
      spendMap.set(name, entry);
    }
    const bySupplierFull = [...spendMap.entries()]
      .map(([name, entry]) => ({ name, ...entry }))
      .sort((a, b) => b.value - a.value);
    const bySupplier = bySupplierFull.slice(0, 8).reverse();
    const topSuppliers = bySupplierFull.slice(0, 6);
    const topSupplierName = bySupplierFull[0]?.name ?? "—";

    const statusMap = new Map<string, number>();
    for (const po of orders) {
      const key = po.status ?? "draft";
      statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
    }
    const byStatus = PO_STATUSES.filter(
      (s) => (statusMap.get(s.value) ?? 0) > 0
    ).map((s) => ({
      name: labelFor(PO_STATUSES, s.value, translate),
      value: statusMap.get(s.value) ?? 0,
    }));

    const months = lastMonths(MONTHS_BACK);
    const monthSpend = new Map<string, number>();
    for (const po of committed) {
      const key = monthKey(po.order_date);
      if (!key) continue;
      monthSpend.set(key, (monthSpend.get(key) ?? 0) + Number(po.total ?? 0));
    }
    const trend = months.map((m) => ({
      label: m.date.toLocaleDateString(locale, { month: "short" }),
      value: Math.round(monthSpend.get(m.key) ?? 0),
    }));

    const kpis = [
      {
        label: translate(
          "procurement.spendAnalysis.kpi.committed.label",
          { ns: "starter" },
          "Total committed"
        ),
        value: formatCurrency(totalCommitted, locale),
        hint: translate(
          "procurement.spendAnalysis.kpi.committed.hint",
          { ns: "starter", count: committed.length },
          `${committed.length} active orders`
        ),
        icon: DollarSign,
        tone: "text-blue-600 bg-blue-500/12 dark:text-blue-400",
      },
      {
        label: translate(
          "procurement.spendAnalysis.kpi.received.label",
          { ns: "starter" },
          "Received value"
        ),
        value: formatCurrency(receivedValue, locale),
        hint: translate(
          "procurement.spendAnalysis.kpi.received.hint",
          { ns: "starter", count: received.length },
          `${received.length} orders received`
        ),
        icon: PackageCheck,
        tone: "text-emerald-600 bg-emerald-500/12 dark:text-emerald-400",
      },
      {
        label: translate(
          "procurement.spendAnalysis.kpi.avg.label",
          { ns: "starter" },
          "Avg. PO value"
        ),
        value: formatCurrency(avgOrder, locale),
        hint: translate(
          "procurement.spendAnalysis.kpi.avg.hint",
          { ns: "starter" },
          "excl. cancelled"
        ),
        icon: ReceiptText,
        tone: "text-sky-600 bg-sky-500/12 dark:text-sky-400",
      },
      {
        label: translate(
          "procurement.spendAnalysis.kpi.topSupplier.label",
          { ns: "starter" },
          "Top supplier"
        ),
        value: topSupplierName,
        hint: translate(
          "procurement.spendAnalysis.kpi.topSupplier.hint",
          { ns: "starter" },
          "by committed spend"
        ),
        icon: BarChart3,
        tone: "text-violet-600 bg-violet-500/12 dark:text-violet-400",
      },
    ];

    return { kpis, bySupplier, byStatus, trend, topSuppliers };
  }, [orders, locale, translate, unassigned]);

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
    padding: [8, 12] as [number, number],
  };

  const supplierOption = {
    color: [chart.palette[0]],
    grid: { left: 6, right: 24, top: 10, bottom: 6, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...tooltipBase,
      valueFormatter: (v: number) => formatCurrency(v, locale),
    },
    xAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      axisLabel: {
        color: chart.axis,
        fontSize: 12,
        formatter: (v: number) => `$${Math.round(v / 1000)}k`,
      },
      splitLine: { lineStyle: { color: chart.grid } },
    },
    yAxis: {
      type: "category",
      data: bySupplier.map((s) => s.name),
      ...axisBase,
    },
    series: [
      {
        type: "bar",
        data: bySupplier.map((s) => s.value),
        barWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
      },
    ],
  };

  const statusOption = {
    color: chart.palette,
    tooltip: {
      trigger: "item",
      ...tooltipBase,
      valueFormatter: (v: number) =>
        translate(
          "procurement.spendAnalysis.chart.status.tooltip",
          { ns: "starter", count: v },
          `${v} orders`
        ),
    },
    legend: {
      orient: "vertical",
      right: 8,
      top: "middle",
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
        data: byStatus,
      },
    ],
  };

  const trendOption = {
    grid: { left: 6, right: 12, top: 16, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      ...tooltipBase,
      valueFormatter: (v: number) => formatCurrency(v, locale),
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: trend.map((t) => t.label),
      ...axisBase,
    },
    yAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      axisLabel: {
        color: chart.axis,
        fontSize: 12,
        formatter: (v: number) => `$${Math.round(v / 1000)}k`,
      },
      splitLine: { lineStyle: { color: chart.grid } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        showSymbol: false,
        data: trend.map((t) => t.value),
        lineStyle: { width: 3, color: chart.palette[0] },
        itemStyle: { color: chart.palette[0] },
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
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">
          {translate(
            "procurement.spendAnalysis.title",
            { ns: "starter" },
            "Spend analysis"
          )}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {translate(
            "procurement.spendAnalysis.description",
            { ns: "starter" },
            "Where procurement spend is going: by supplier, by order status, and over time."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    kpi.tone
                  )}
                >
                  <kpi.icon className="size-4" />
                </span>
              </div>
              {loading ? (
                <Skeleton className="mt-2 h-8 w-24" />
              ) : (
                <p className="mt-1 truncate text-2xl font-semibold tabular-nums tracking-tight">
                  {kpi.value}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>
              {translate(
                "procurement.spendAnalysis.chart.supplier.title",
                { ns: "starter" },
                "Spend by supplier"
              )}
            </CardTitle>
            <CardDescription>
              {translate(
                "procurement.spendAnalysis.chart.supplier.description",
                { ns: "starter" },
                "Committed spend across active purchase orders."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : bySupplier.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                {translate(
                  "procurement.spendAnalysis.chart.supplier.empty",
                  { ns: "starter" },
                  "No spend to chart yet."
                )}
              </div>
            ) : (
              <ReactECharts
                key={`supplier-${chart.isDark}`}
                option={supplierOption}
                style={{ height: 288 }}
                opts={{ renderer: "svg" }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {translate(
                "procurement.spendAnalysis.chart.status.title",
                { ns: "starter" },
                "PO status mix"
              )}
            </CardTitle>
            <CardDescription>
              {translate(
                "procurement.spendAnalysis.chart.status.description",
                { ns: "starter" },
                "Every purchase order, by current status."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : byStatus.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                {translate(
                  "procurement.spendAnalysis.chart.status.empty",
                  { ns: "starter" },
                  "No orders yet."
                )}
              </div>
            ) : (
              <ReactECharts
                key={`status-${chart.isDark}`}
                option={statusOption}
                style={{ height: 288 }}
                opts={{ renderer: "svg" }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>
              {translate(
                "procurement.spendAnalysis.chart.trend.title",
                { ns: "starter" },
                "Monthly spend trend"
              )}
            </CardTitle>
            <CardDescription>
              {translate(
                "procurement.spendAnalysis.chart.trend.description",
                { ns: "starter", months: MONTHS_BACK },
                `Committed spend by order date over the last ${MONTHS_BACK} months.`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ReactECharts
                key={`trend-${chart.isDark}`}
                option={trendOption}
                style={{ height: 256 }}
                opts={{ renderer: "svg" }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {translate(
                "procurement.spendAnalysis.table.title",
                { ns: "starter" },
                "Top suppliers"
              )}
            </CardTitle>
            <CardDescription>
              {translate(
                "procurement.spendAnalysis.table.description",
                { ns: "starter" },
                "Click a supplier to open its detail."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : topSuppliers.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                {translate(
                  "procurement.spendAnalysis.table.empty",
                  { ns: "starter" },
                  "No suppliers with spend yet."
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {topSuppliers.map((s) => (
                  <button
                    type="button"
                    key={s.name}
                    disabled={s.supplierId === null}
                    onClick={() =>
                      s.supplierId !== null &&
                      navigate(getSupplierShowPath(s.supplierId))
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-accent disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {translate(
                          "procurement.spendAnalysis.table.orderCount",
                          { ns: "starter", count: s.count },
                          `${s.count} orders`
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatCurrency(s.value, locale)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SpendAnalysisDashboard;
