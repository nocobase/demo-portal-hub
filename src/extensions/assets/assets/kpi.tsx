import ReactECharts from "echarts-for-react";
import { Boxes, PackageCheck, ShieldCheck, Wrench } from "lucide-react";
import { useMemo } from "react";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartTheme } from "@/extensions/home/theme";
import { ASSET_CATEGORIES, ASSET_STATUSES, formatCurrency, labelFor } from "../constants";
import type { AssetRecord } from "../types";

type Stat = {
  label: string;
  value: string;
  hint: string;
  icon: typeof Boxes;
  tone: string;
};

export function AssetsKpi({
  assets,
  locale,
}: {
  assets: AssetRecord[];
  locale: string;
}) {
  const chart = useChartTheme();

  const { stats, statusData, categoryData } = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalValue = 0;
    for (const asset of assets) {
      const status = asset.status ?? "in_stock";
      const category = asset.category ?? "other";
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      byCategory[category] = (byCategory[category] ?? 0) + 1;
      totalValue += Number(asset.value ?? 0);
    }

    const statusData = ASSET_STATUSES.map((status) => ({
      name: status.label,
      value: byStatus[status.value] ?? 0,
    })).filter((item) => item.value > 0);

    const categoryData = ASSET_CATEGORIES.map((category) => ({
      name: labelFor(ASSET_CATEGORIES, category.value),
      value: byCategory[category.value] ?? 0,
    }));

    const stats: Stat[] = [
      {
        label: "Total assets",
        value: String(assets.length),
        hint: formatCurrency(totalValue, locale) + " book value",
        icon: Boxes,
        tone: "text-blue-600 bg-blue-500/12 dark:text-blue-400",
      },
      {
        label: "Assigned",
        value: String(byStatus["assigned"] ?? 0),
        hint: "In use by staff",
        icon: ShieldCheck,
        tone: "text-sky-600 bg-sky-500/12 dark:text-sky-400",
      },
      {
        label: "In stock",
        value: String(byStatus["in_stock"] ?? 0),
        hint: "Ready to assign",
        icon: PackageCheck,
        tone: "text-teal-600 bg-teal-500/12 dark:text-teal-400",
      },
      {
        label: "In repair",
        value: String(byStatus["repair"] ?? 0),
        hint: "Out for service",
        icon: Wrench,
        tone: "text-amber-600 bg-amber-500/12 dark:text-amber-400",
      },
    ];

    return { stats, statusData, categoryData };
  }, [assets, locale]);

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

  const statusOption = {
    color: chart.palette,
    tooltip: { trigger: "item", ...tooltipBase },
    legend: {
      orient: "vertical",
      right: 0,
      top: "center",
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 10,
      textStyle: { color: chart.axis, fontSize: 12 },
    },
    series: [
      {
        type: "pie",
        radius: ["58%", "82%"],
        center: ["32%", "50%"],
        avoidLabelOverlap: false,
        padAngle: 2,
        itemStyle: { borderRadius: 6 },
        label: { show: false },
        labelLine: { show: false },
        data: statusData,
      },
    ],
  };

  const categoryOption = {
    color: [chart.palette[0]],
    grid: { left: 6, right: 12, top: 16, bottom: 8, containLabel: true },
    tooltip: { trigger: "axis", ...tooltipBase },
    xAxis: { type: "category", data: categoryData.map((d) => d.name), ...axisBase },
    yAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
      minInterval: 1,
    },
    series: [
      {
        name: "Assets",
        type: "bar",
        data: categoryData.map((d) => d.value),
        barWidth: 26,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>By status</CardTitle>
            <CardDescription>Where every device sits right now.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              key={`as-status-${chart.isDark}`}
              option={statusOption}
              style={{ height: 240 }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>By category</CardTitle>
            <CardDescription>Inventory mix across device types.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              key={`as-cat-${chart.isDark}`}
              option={categoryOption}
              style={{ height: 240 }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  const iconNode: ReactNode = <Icon className="size-5" />;
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {stat.value}
            </p>
          </div>
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              stat.tone
            )}
          >
            {iconNode}
          </span>
        </div>
        <p className="mt-3 truncate text-xs text-muted-foreground">{stat.hint}</p>
      </CardContent>
    </Card>
  );
}
