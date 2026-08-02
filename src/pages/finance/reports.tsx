import { useList, useTranslate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartTheme } from "@/pages/home/theme";
import { money, PageHeader, SimpleTable } from "./shared";
import type { Expense, Invoice } from "./types";

function employeeName(exp: Expense): string {
  return exp.employee?.nickname || exp.employee?.username || exp.employee?.email || "—";
}

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const due = new Date(iso).getTime();
  if (Number.isNaN(due)) return null;
  return Math.floor((due - Date.now()) / (1000 * 60 * 60 * 24));
}

export function FinanceReports() {
  const t = useTranslate();
  const chart = useChartTheme();

  const { result: invResult } = useList<Invoice>({
    resource: "hub_fin_invoices",
    pagination: { mode: "off" },
  });
  const { result: expResult } = useList<Expense>({
    resource: "hub_fin_expenses",
    pagination: { mode: "off" },
    meta: { appends: ["employee"] },
  });
  const invoices = invResult?.data ?? [];
  const expenses = expResult?.data ?? [];

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

  // ---- AR aging buckets ----------------------------------------------------
  const AGING_BUCKET_KEYS = [
    ["finance.reports.aging.current", "Current"],
    ["finance.reports.aging.d1_30", "1–30 days"],
    ["finance.reports.aging.d31_60", "31–60 days"],
    ["finance.reports.aging.d61_90", "61–90 days"],
    ["finance.reports.aging.d90plus", "90+ days"],
  ] as const;

  const aging = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0];
    for (const inv of invoices) {
      if (inv.status === "paid" || inv.status === "draft") continue;
      const days = daysUntil(inv.due_date);
      const overdueBy = days === null ? 0 : -days;
      const amt = Number(inv.amount) || 0;
      let idx = 0;
      if (overdueBy > 90) idx = 4;
      else if (overdueBy > 60) idx = 3;
      else if (overdueBy > 30) idx = 2;
      else if (overdueBy > 0) idx = 1;
      else idx = 0;
      buckets[idx] += amt;
      counts[idx] += 1;
    }
    return { buckets: buckets.map((v) => Math.round(v)), counts };
  }, [invoices]);

  const agingLabels = AGING_BUCKET_KEYS.map(([key, fallback]) => t(key, fallback));
  const agingOption = {
    color: [chart.palette[0], chart.palette[1], chart.palette[2], chart.palette[3] ?? chart.palette[1], chart.palette[4] ?? chart.palette[2]],
    grid: { left: 6, right: 12, top: 16, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...tooltipBase,
      valueFormatter: (v: number) => money(v),
    },
    xAxis: { type: "category", data: agingLabels, ...axisBase },
    yAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
      axisLabel: { color: chart.axis, fontSize: 12, formatter: (v: number) => `$${v / 1000}k` },
    },
    series: [
      {
        type: "bar",
        data: aging.buckets,
        barWidth: 34,
        itemStyle: { color: chart.palette[0], borderRadius: [6, 6, 0, 0] },
      },
    ],
  };

  // ---- Spend by employee ----------------------------------------------------
  const byEmployee = useMemo(() => {
    const totals = new Map<string, number>();
    for (const exp of expenses) {
      if (exp.status === "rejected") continue;
      const name = employeeName(exp);
      totals.set(name, (totals.get(name) ?? 0) + (Number(exp.amount) || 0));
    }
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, amount]) => ({ name, amount: Math.round(amount) }));
  }, [expenses]);

  const employeeOption = {
    color: [chart.palette[2]],
    grid: { left: 6, right: 24, top: 8, bottom: 8, containLabel: true },
    tooltip: { trigger: "axis", ...tooltipBase, valueFormatter: (v: number) => money(v) },
    xAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
      axisLabel: { color: chart.axis, fontSize: 12, formatter: (v: number) => `$${v / 1000}k` },
    },
    yAxis: {
      type: "category",
      data: byEmployee.map((e) => e.name).reverse(),
      ...axisBase,
    },
    series: [
      {
        type: "bar",
        data: byEmployee.map((e) => e.amount).reverse(),
        barWidth: 16,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
      },
    ],
  };

  // ---- Client leaderboard ----------------------------------------------------
  const byClient = useMemo(() => {
    const rows = new Map<string, { invoiced: number; collected: number; count: number }>();
    for (const inv of invoices) {
      const key = inv.client_name || "—";
      const row = rows.get(key) ?? { invoiced: 0, collected: 0, count: 0 };
      const amt = Number(inv.amount) || 0;
      row.invoiced += amt;
      if (inv.status === "paid") row.collected += amt;
      row.count += 1;
      rows.set(key, row);
    }
    return [...rows.entries()]
      .map(([client, v]) => ({
        client,
        ...v,
        rate: v.invoiced > 0 ? Math.round((v.collected / v.invoiced) * 100) : 0,
      }))
      .sort((a, b) => b.invoiced - a.invoiced);
  }, [invoices]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("finance.reports.title", "Reports")}
        description={t(
          "finance.reports.subtitle",
          "Breakdowns behind the headline numbers — aging, spend concentration and client collection."
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("finance.reports.aging.title", "Accounts receivable aging")}</CardTitle>
          <CardDescription>
            {t(
              "finance.reports.aging.desc",
              "Unpaid invoice value grouped by how far past due it is."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReactECharts
            key={`aging-${chart.isDark}`}
            option={agingOption}
            style={{ height: 260 }}
            opts={{ renderer: "svg" }}
          />
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {agingLabels.map((label, i) => (
              <div key={label} className="rounded-md border px-3 py-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold tabular-nums">{money(aging.buckets[i])}</p>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "finance.reports.aging.count",
                    { ns: "starter", count: aging.counts[i] },
                    `${aging.counts[i]} invoice${aging.counts[i] === 1 ? "" : "s"}`
                  )}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("finance.reports.employee.title", "Top spenders")}</CardTitle>
            <CardDescription>
              {t("finance.reports.employee.desc", "Approved + reimbursed spend by employee.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {byEmployee.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t("finance.reports.employee.empty", "No expense claims yet.")}
              </p>
            ) : (
              <ReactECharts
                key={`emp-${chart.isDark}`}
                option={employeeOption}
                style={{ height: Math.max(220, byEmployee.length * 34) }}
                opts={{ renderer: "svg" }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("finance.reports.client.title", "Client collection")}</CardTitle>
            <CardDescription>
              {t("finance.reports.client.desc", "Invoiced vs. collected by client.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleTable
              headers={[
                t("finance.reports.client.col.client", "Client"),
                t("finance.reports.client.col.invoiced", "Invoiced"),
                t("finance.reports.client.col.rate", "Collected"),
              ]}
              align={["left", "right", "right"]}
            >
              {byClient.map((row) => (
                <tr key={row.client}>
                  <td className="px-3 py-2 font-medium">{row.client}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{money(row.invoiced)}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            row.rate >= 80 ? "bg-emerald-500" : row.rate >= 40 ? "bg-blue-500" : "bg-amber-500"
                          )}
                          style={{ width: `${Math.min(100, row.rate)}%` }}
                        />
                      </div>
                      <span className="w-9 tabular-nums text-xs text-muted-foreground">{row.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </SimpleTable>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
