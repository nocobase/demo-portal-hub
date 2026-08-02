import { useList, useTranslate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChartTheme } from "@/pages/home/theme";
import { money, PageHeader, StatCard } from "./shared";
import type { Expense, Invoice } from "./types";

const MONTH_KEYS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/** Last six calendar months as [{ key: "2026-03", monthIndex: 2 }]. */
function lastSixMonths() {
  const out: { key: string; monthIndex: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      monthIndex: d.getMonth(),
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

export function CashFlow() {
  const t = useTranslate();
  const chart = useChartTheme();

  const { result: invResult } = useList<Invoice>({
    resource: "hub_fin_invoices",
    pagination: { mode: "off" },
  });
  const { result: expResult } = useList<Expense>({
    resource: "hub_fin_expenses",
    pagination: { mode: "off" },
  });
  const invoices = invResult?.data ?? [];
  const expenses = expResult?.data ?? [];

  const months = useMemo(() => lastSixMonths(), []);
  const monthLabels = useMemo(
    () =>
      months.map((m) =>
        t(
          `finance.months.${MONTH_KEYS[m.monthIndex]}`,
          MONTH_KEYS[m.monthIndex].replace(/^\w/, (c) => c.toUpperCase())
        )
      ),
    [months, t]
  );

  // ---- Monthly inflow (paid invoices by issue date) vs outflow (approved +
  // reimbursed expenses by spent_at) --------------------------------------
  const series = useMemo(() => {
    const inflow = new Map<string, number>();
    for (const inv of invoices) {
      if (inv.status !== "paid") continue;
      const key = monthKey(inv.issue_date);
      if (!key) continue;
      inflow.set(key, (inflow.get(key) ?? 0) + (Number(inv.amount) || 0));
    }
    const outflow = new Map<string, number>();
    for (const exp of expenses) {
      if (exp.status !== "approved" && exp.status !== "reimbursed") continue;
      const key = monthKey(exp.spent_at);
      if (!key) continue;
      outflow.set(key, (outflow.get(key) ?? 0) + (Number(exp.amount) || 0));
    }
    const inflowSeries = months.map((m) => Math.round(inflow.get(m.key) ?? 0));
    const outflowSeries = months.map((m) => Math.round(outflow.get(m.key) ?? 0));
    const netSeries = months.map((_, i) => inflowSeries[i] - outflowSeries[i]);
    return { inflowSeries, outflowSeries, netSeries };
  }, [invoices, expenses, months]);

  const kpis = useMemo(() => {
    const inflow = series.inflowSeries.reduce((a, b) => a + b, 0);
    const outflow = series.outflowSeries.reduce((a, b) => a + b, 0);
    return { inflow, outflow, net: inflow - outflow };
  }, [series]);

  const inflowLabel = t("finance.cashflow.series.inflow", "Inflow");
  const outflowLabel = t("finance.cashflow.series.outflow", "Outflow");
  const netLabel = t("finance.cashflow.series.net", "Net");

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

  const option = {
    color: [chart.palette[0], chart.palette[5] ?? chart.palette[1], chart.palette[2]],
    grid: { left: 6, right: 12, top: 40, bottom: 8, containLabel: true },
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
      axisPointer: { type: "shadow" },
      ...tooltipBase,
      valueFormatter: (v: number) => money(v),
    },
    xAxis: {
      type: "category",
      data: monthLabels,
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
        name: inflowLabel,
        type: "bar",
        data: series.inflowSeries,
        barWidth: 18,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      {
        name: outflowLabel,
        type: "bar",
        data: series.outflowSeries,
        barWidth: 18,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      {
        name: netLabel,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3 },
        data: series.netSeries,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("finance.cashflow.title", "Cash flow")}
        description={t(
          "finance.cashflow.subtitle",
          "Monthly cash in versus cash out over the last six months."
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("finance.cashflow.kpi.inflow", "Inflow")}
          value={money(kpis.inflow)}
          hint={t("finance.cashflow.kpi.inflow.hint", "Paid invoices, last 6 months")}
          icon={<ArrowUpRight className="size-4" />}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label={t("finance.cashflow.kpi.outflow", "Outflow")}
          value={money(kpis.outflow)}
          hint={t(
            "finance.cashflow.kpi.outflow.hint",
            "Approved & reimbursed expenses, last 6 months"
          )}
          icon={<ArrowDownRight className="size-4" />}
          tone="bg-red-500/12 text-red-600 dark:text-red-400"
        />
        <StatCard
          label={t("finance.cashflow.kpi.net", "Net")}
          value={money(kpis.net)}
          hint={t("finance.cashflow.kpi.net.hint", "Inflow minus outflow")}
          icon={<Scale className="size-4" />}
          tone="bg-blue-500/12 text-blue-600 dark:text-blue-400"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("finance.cashflow.chart.title", "Inflow vs outflow")}</CardTitle>
          <CardDescription>
            {t(
              "finance.cashflow.chart.desc",
              "Paid invoices by issue date against approved/reimbursed expense spend by spend date, with net cash flow."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReactECharts
            key={`cashflow-${chart.isDark}`}
            option={option}
            style={{ height: 320 }}
            opts={{ renderer: "svg" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
