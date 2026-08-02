import { useList, useTranslate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { CalendarOff, Network, UserCheck, Users } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartTheme } from "@/pages/home/theme";
import type { EmployeeRecord } from "./types";

export function HrStats() {
  const translate = useTranslate();
  const chart = useChartTheme();
  const { result } = useList<EmployeeRecord>({
    resource: "hub_hr_employees",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    meta: { appends: ["department"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const employees = result.data;

  const unassignedLabel = translate(
    "hr.stats.unassigned",
    { ns: "starter" },
    "Unassigned"
  );

  const { headcount, active, onLeave, terminated, byDept, byTenure } = useMemo(() => {
    const active = employees.filter((e) => e.status === "active").length;
    const onLeave = employees.filter((e) => e.status === "onleave").length;
    const terminated = employees.filter((e) => e.status === "terminated").length;
    const counts = new Map<string, number>();
    for (const emp of employees) {
      if (emp.status === "terminated") continue;
      const name = emp.department?.name ?? unassignedLabel;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const byDept = Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const now = Date.now();
    const yearsAgo = (years: number) => now - years * 365.25 * 24 * 60 * 60 * 1000;
    const tenureBuckets = [
      { key: "lt1", min: yearsAgo(1), max: Infinity },
      { key: "1to3", min: yearsAgo(3), max: yearsAgo(1) },
      { key: "3to5", min: yearsAgo(5), max: yearsAgo(3) },
      { key: "5plus", min: -Infinity, max: yearsAgo(5) },
    ];
    const tenureCounts = new Map(tenureBuckets.map((b) => [b.key, 0]));
    for (const emp of employees) {
      if (emp.status === "terminated" || !emp.hire_date) continue;
      const hired = new Date(emp.hire_date).getTime();
      const bucket = tenureBuckets.find((b) => hired > b.min && hired <= b.max);
      if (bucket) tenureCounts.set(bucket.key, (tenureCounts.get(bucket.key) ?? 0) + 1);
    }
    const byTenure = tenureBuckets.map((b) => ({
      key: b.key,
      value: tenureCounts.get(b.key) ?? 0,
    }));

    return { headcount: employees.length, active, onLeave, terminated, byDept, byTenure };
  }, [employees, unassignedLabel]);

  const deptCount = byDept.length;

  const peopleSuffix = translate("hr.stats.peopleSuffix", { ns: "starter" }, "people");

  const tenureLabels: Record<string, string> = {
    lt1: translate("hr.stats.tenure.lt1", { ns: "starter" }, "< 1 year"),
    "1to3": translate("hr.stats.tenure.1to3", { ns: "starter" }, "1–3 years"),
    "3to5": translate("hr.stats.tenure.3to5", { ns: "starter" }, "3–5 years"),
    "5plus": translate("hr.stats.tenure.5plus", { ns: "starter" }, "5+ years"),
  };

  const statusPieOption = {
    color: [chart.palette[0], chart.palette[3], chart.palette[5]],
    tooltip: {
      trigger: "item",
      backgroundColor: chart.tooltipBg,
      borderColor: chart.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: chart.tooltipText, fontSize: 12 },
      valueFormatter: (v: number) => `${v} ${peopleSuffix}`,
    },
    legend: {
      bottom: 0,
      textStyle: { color: chart.axis, fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: chart.tooltipBg, borderWidth: 2 },
        label: { show: false },
        data: [
          {
            name: translate("hr.stats.active.label", { ns: "starter" }, "Active"),
            value: active,
          },
          {
            name: translate("hr.stats.onLeave.label", { ns: "starter" }, "On leave"),
            value: onLeave,
          },
          {
            name: translate(
              "hr.enums.employeeStatus.terminated",
              { ns: "starter" },
              "Terminated"
            ),
            value: terminated,
          },
        ],
      },
    ],
  };

  const tenureBarOption = {
    color: [chart.palette[1]],
    grid: { left: 6, right: 16, top: 12, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: chart.tooltipBg,
      borderColor: chart.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: chart.tooltipText, fontSize: 12 },
      valueFormatter: (v: number) => `${v} ${peopleSuffix}`,
    },
    xAxis: {
      type: "category",
      data: byTenure.map((t) => tenureLabels[t.key]),
      axisLine: { lineStyle: { color: chart.grid } },
      axisTick: { show: false },
      axisLabel: { color: chart.axis, fontSize: 12 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
      axisLabel: { color: chart.axis, fontSize: 12 },
      minInterval: 1,
    },
    series: [
      {
        type: "bar",
        data: byTenure.map((t) => t.value),
        barWidth: 28,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const barOption = {
    color: [chart.palette[0]],
    grid: { left: 6, right: 16, top: 12, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: chart.tooltipBg,
      borderColor: chart.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: chart.tooltipText, fontSize: 12 },
      valueFormatter: (v: number) => `${v} ${peopleSuffix}`,
    },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
      axisLabel: { color: chart.axis, fontSize: 12 },
      minInterval: 1,
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: byDept.map((d) => d.name),
      axisLine: { lineStyle: { color: chart.grid } },
      axisTick: { show: false },
      axisLabel: { color: chart.axis, fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        data: byDept.map((d) => d.value),
        barWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="grid grid-cols-2 gap-4 xl:col-span-1">
        <StatCard
          label={translate("hr.stats.headcount.label", { ns: "starter" }, "Headcount")}
          value={String(headcount)}
          hint={translate("hr.stats.headcount.hint", { ns: "starter" }, "Total on file")}
          icon={<Users className="size-4" />}
          tone="text-blue-600 bg-blue-500/12 dark:text-blue-400"
        />
        <StatCard
          label={translate("hr.stats.active.label", { ns: "starter" }, "Active")}
          value={String(active)}
          hint={translate("hr.stats.active.hint", { ns: "starter" }, "Currently working")}
          icon={<UserCheck className="size-4" />}
          tone="text-emerald-600 bg-emerald-500/12 dark:text-emerald-400"
        />
        <StatCard
          label={translate("hr.stats.onLeave.label", { ns: "starter" }, "On leave")}
          value={String(onLeave)}
          hint={translate("hr.stats.onLeave.hint", { ns: "starter" }, "Away right now")}
          icon={<CalendarOff className="size-4" />}
          tone="text-amber-600 bg-amber-500/12 dark:text-amber-400"
        />
        <StatCard
          label={translate("hr.stats.departments.label", { ns: "starter" }, "Departments")}
          value={String(deptCount)}
          hint={translate("hr.stats.departments.hint", { ns: "starter" }, "With staff")}
          icon={<Network className="size-4" />}
          tone="text-teal-600 bg-teal-500/12 dark:text-teal-400"
        />
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>
            {translate("hr.stats.chart.title", { ns: "starter" }, "Headcount by department")}
          </CardTitle>
          <CardDescription>
            {translate(
              "hr.stats.chart.description",
              { ns: "starter" },
              "Active and on-leave staff per team."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {byDept.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {translate("hr.stats.chart.empty", { ns: "starter" }, "No staff assigned yet.")}
            </p>
          ) : (
            <ReactECharts
              key={`hc-${chart.isDark}`}
              option={barOption}
              style={{ height: Math.max(180, byDept.length * 34) }}
              opts={{ renderer: "svg" }}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {translate("hr.stats.statusChart.title", { ns: "starter" }, "Status breakdown")}
          </CardTitle>
          <CardDescription>
            {translate(
              "hr.stats.statusChart.description",
              { ns: "starter" },
              "Active, on-leave and terminated headcount."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {headcount === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {translate("hr.stats.chart.empty", { ns: "starter" }, "No staff assigned yet.")}
            </p>
          ) : (
            <ReactECharts
              key={`status-${chart.isDark}`}
              option={statusPieOption}
              style={{ height: 240 }}
              opts={{ renderer: "svg" }}
            />
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>
            {translate("hr.stats.tenureChart.title", { ns: "starter" }, "Tenure")}
          </CardTitle>
          <CardDescription>
            {translate(
              "hr.stats.tenureChart.description",
              { ns: "starter" },
              "How long the current team has been with us."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {headcount === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {translate("hr.stats.chart.empty", { ns: "starter" }, "No staff assigned yet.")}
            </p>
          ) : (
            <ReactECharts
              key={`tenure-${chart.isDark}`}
              option={tenureBarOption}
              style={{ height: 240 }}
              opts={{ renderer: "svg" }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              tone
            )}
          >
            {icon}
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
