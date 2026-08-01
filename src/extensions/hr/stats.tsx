import { useList } from "@refinedev/core";
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
import { useChartTheme } from "@/extensions/home/theme";
import type { EmployeeRecord } from "./types";

export function HrStats() {
  const chart = useChartTheme();
  const { result } = useList<EmployeeRecord>({
    resource: "hub_hr_employees",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    meta: { appends: ["department"] },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const employees = result.data;

  const { headcount, active, onLeave, byDept } = useMemo(() => {
    const active = employees.filter((e) => e.status === "active").length;
    const onLeave = employees.filter((e) => e.status === "onleave").length;
    const counts = new Map<string, number>();
    for (const emp of employees) {
      if (emp.status === "terminated") continue;
      const name = emp.department?.name ?? "Unassigned";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const byDept = Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return { headcount: employees.length, active, onLeave, byDept };
  }, [employees]);

  const deptCount = byDept.length;

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
      valueFormatter: (v: number) => `${v} people`,
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
          label="Headcount"
          value={String(headcount)}
          hint="Total on file"
          icon={<Users className="size-4" />}
          tone="text-blue-600 bg-blue-500/12 dark:text-blue-400"
        />
        <StatCard
          label="Active"
          value={String(active)}
          hint="Currently working"
          icon={<UserCheck className="size-4" />}
          tone="text-emerald-600 bg-emerald-500/12 dark:text-emerald-400"
        />
        <StatCard
          label="On leave"
          value={String(onLeave)}
          hint="Away right now"
          icon={<CalendarOff className="size-4" />}
          tone="text-amber-600 bg-amber-500/12 dark:text-amber-400"
        />
        <StatCard
          label="Departments"
          value={String(deptCount)}
          hint="With staff"
          icon={<Network className="size-4" />}
          tone="text-teal-600 bg-teal-500/12 dark:text-teal-400"
        />
      </div>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Headcount by department</CardTitle>
          <CardDescription>Active and on-leave staff per team.</CardDescription>
        </CardHeader>
        <CardContent>
          {byDept.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No staff assigned yet.
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
