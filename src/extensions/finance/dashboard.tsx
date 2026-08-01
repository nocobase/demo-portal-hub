import { useList } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { AlertTriangle, DollarSign, Receipt, Wallet } from "lucide-react";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChartTheme } from "@/extensions/home/theme";
import { EXPENSE_CATEGORIES, INVOICE_STATUSES } from "./constants";
import { money, PageHeader, StatCard } from "./shared";
import type { Expense, Invoice } from "./types";

function hexA(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Last six calendar months as [{ key: "2026-03", label: "Mar" }]. */
function lastSixMonths() {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: MONTH_LABELS[d.getMonth()],
    });
  }
  return out;
}

function monthKey(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function FinanceDashboard() {
  const chart = useChartTheme();

  const { result: expResult } = useList<Expense>({
    resource: "hub_fin_expenses",
    pagination: { mode: "off" },
  });
  const { result: invResult } = useList<Invoice>({
    resource: "hub_fin_invoices",
    pagination: { mode: "off" },
  });
  const expenses = expResult?.data ?? [];
  const invoices = invResult?.data ?? [];

  // ---- KPIs ----------------------------------------------------------------
  const kpis = useMemo(() => {
    let outstanding = 0;
    let overdue = 0;
    let collected = 0;
    for (const inv of invoices) {
      const amt = Number(inv.amount) || 0;
      if (inv.status === "paid") collected += amt;
      else outstanding += amt;
      if (inv.status === "overdue") overdue += amt;
    }
    const pendingExpenses = expenses.filter((e) => e.status === "pending");
    const pendingAmount = pendingExpenses.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0
    );
    return {
      outstanding,
      overdue,
      collected,
      pendingCount: pendingExpenses.length,
      pendingAmount,
    };
  }, [invoices, expenses]);

  // ---- Spend by category (bar) --------------------------------------------
  const spendByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const exp of expenses) {
      if (exp.status === "rejected") continue;
      const key = exp.category || "other";
      totals.set(key, (totals.get(key) ?? 0) + (Number(exp.amount) || 0));
    }
    return EXPENSE_CATEGORIES.map((c) => ({
      label: c.label,
      value: Math.round(totals.get(c.value) ?? 0),
    }));
  }, [expenses]);

  // ---- AR by status (donut) -----------------------------------------------
  const arByStatus = useMemo(() => {
    const totals = new Map<string, number>();
    for (const inv of invoices) {
      const key = inv.status || "draft";
      totals.set(key, (totals.get(key) ?? 0) + (Number(inv.amount) || 0));
    }
    return INVOICE_STATUSES.filter((s) => (totals.get(s.value) ?? 0) > 0).map(
      (s) => ({ name: s.label, value: Math.round(totals.get(s.value) ?? 0) })
    );
  }, [invoices]);

  // ---- Monthly trend: invoiced vs collected (line) ------------------------
  const trend = useMemo(() => {
    const months = lastSixMonths();
    const invoiced = new Map<string, number>();
    const collected = new Map<string, number>();
    for (const inv of invoices) {
      const amt = Number(inv.amount) || 0;
      const issued = monthKey(inv.issue_date);
      if (issued) invoiced.set(issued, (invoiced.get(issued) ?? 0) + amt);
      if (inv.status === "paid" && issued) {
        collected.set(issued, (collected.get(issued) ?? 0) + amt);
      }
    }
    return {
      labels: months.map((m) => m.label),
      invoiced: months.map((m) => Math.round(invoiced.get(m.key) ?? 0)),
      collected: months.map((m) => Math.round(collected.get(m.key) ?? 0)),
    };
  }, [invoices]);

  // ---- ECharts option bases -----------------------------------------------
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

  const categoryOption = {
    color: [chart.palette[0]],
    grid: { left: 6, right: 12, top: 16, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...tooltipBase,
      valueFormatter: (v: number) => money(v),
    },
    xAxis: {
      type: "category",
      data: spendByCategory.map((d) => d.label),
      ...axisBase,
    },
    yAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
      axisLabel: {
        color: chart.axis,
        fontSize: 12,
        formatter: (v: number) => `$${v / 1000}k`,
      },
    },
    series: [
      {
        type: "bar",
        data: spendByCategory.map((d) => d.value),
        barWidth: 30,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
    ],
  };

  const arOption = {
    color: chart.palette,
    tooltip: {
      trigger: "item",
      ...tooltipBase,
      valueFormatter: (v: number) => money(v),
    },
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
        data: arByStatus,
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
    tooltip: {
      trigger: "axis",
      ...tooltipBase,
      valueFormatter: (v: number) => money(v),
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: trend.labels,
      ...axisBase,
    },
    yAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
      axisLabel: {
        color: chart.axis,
        fontSize: 12,
        formatter: (v: number) => `$${v / 1000}k`,
      },
    },
    series: [
      {
        name: "Invoiced",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        data: trend.invoiced,
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
        name: "Collected",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        data: trend.collected,
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
      <PageHeader
        title="Finance"
        description="Cash in, cash out — receivables and expense spend at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding AR"
          value={money(kpis.outstanding)}
          hint="Awaiting collection"
          icon={<Wallet className="size-4" />}
          tone="bg-blue-500/12 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Overdue"
          value={money(kpis.overdue)}
          hint="Past due date"
          icon={<AlertTriangle className="size-4" />}
          tone="bg-red-500/12 text-red-600 dark:text-red-400"
        />
        <StatCard
          label="Collected"
          value={money(kpis.collected)}
          hint="Paid invoices"
          icon={<DollarSign className="size-4" />}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Expenses to approve"
          value={String(kpis.pendingCount)}
          hint={`${money(kpis.pendingAmount)} pending`}
          icon={<Receipt className="size-4" />}
          tone="bg-amber-500/12 text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Spend by category</CardTitle>
            <CardDescription>Approved & pending expense spend.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              key={`cat-${chart.isDark}`}
              option={categoryOption}
              style={{ height: 288 }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AR by status</CardTitle>
            <CardDescription>Receivable value per invoice state.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              key={`ar-${chart.isDark}`}
              option={arOption}
              style={{ height: 288 }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoiced vs collected</CardTitle>
          <CardDescription>Monthly trend over the last six months.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReactECharts
            key={`trend-${chart.isDark}`}
            option={trendOption}
            style={{ height: 280 }}
            opts={{ renderer: "svg" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
