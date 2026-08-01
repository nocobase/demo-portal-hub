import { useList } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { AlertTriangle, Boxes, DollarSign, PackageX } from "lucide-react";
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
import {
  CATEGORIES,
  formatCurrency,
  formatNumber,
  labelFor,
  signedQty,
} from "./constants";
import { useChartTheme } from "@/extensions/home/theme";
import { inventoryRoutes } from "./routes";
import { EnumBadge, hexA, useLocale } from "./shared";
import type { ProductRecord, StockMoveRecord } from "./types";

const WEEKS_BACK = 8;

export function InventoryDashboard() {
  const locale = useLocale();
  const chart = useChartTheme();
  const navigate = useNavigate();

  const products = useList<ProductRecord>({
    resource: "hub_inv_products",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    errorNotification: false,
    queryOptions: { retry: false },
  });
  const moves = useList<StockMoveRecord>({
    resource: "hub_inv_stock_moves",
    pagination: { mode: "server", currentPage: 1, pageSize: 2000 },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const loading = products.query.isLoading || moves.query.isLoading;

  const onHand = useMemo(() => {
    const map = new Map<string, number>();
    for (const move of moves.result.data) {
      if (move.product_id === null || move.product_id === undefined) continue;
      const key = String(move.product_id);
      map.set(key, (map.get(key) ?? 0) + signedQty(move.type, move.qty));
    }
    return map;
  }, [moves.result.data]);

  const enriched = useMemo(
    () =>
      products.result.data.map((product) => {
        const qty = onHand.get(String(product.id)) ?? 0;
        const reorder = Number(product.reorder_level ?? 0);
        return {
          product,
          qty,
          reorder,
          low: qty <= reorder,
          value: qty * Number(product.unit_price ?? 0),
        };
      }),
    [products.result.data, onHand]
  );

  const totalUnits = enriched.reduce((sum, e) => sum + Math.max(0, e.qty), 0);
  const totalValue = enriched.reduce((sum, e) => sum + Math.max(0, e.value), 0);
  const lowStock = enriched
    .filter((e) => e.low && (e.product.status ?? "active") === "active")
    .sort((a, b) => a.qty - b.qty);
  const activeCount = enriched.filter(
    (e) => (e.product.status ?? "active") === "active"
  ).length;

  // --- Stock level by product (top 12 by on-hand) ---
  const byProduct = [...enriched]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 12)
    .reverse();

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

  const stockOption = {
    grid: { left: 6, right: 16, top: 12, bottom: 8, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    xAxis: {
      type: "value",
      ...axisBase,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: chart.grid } },
    },
    yAxis: {
      type: "category",
      data: byProduct.map((e) => e.product.name ?? "—"),
      ...axisBase,
    },
    series: [
      {
        type: "bar",
        barWidth: 12,
        data: byProduct.map((e) => ({
          value: e.qty,
          itemStyle: {
            color: e.low ? chart.palette[5] : chart.palette[0],
            borderRadius: [0, 4, 4, 0],
          },
        })),
      },
    ],
  };

  // --- Moves trend: in vs out over the last N weeks ---
  const trend = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: WEEKS_BACK }, (_, i) => ({
      label: `W-${WEEKS_BACK - 1 - i}`,
      inQty: 0,
      outQty: 0,
    }));
    for (const move of moves.result.data) {
      if (!move.moved_at) continue;
      const days = Math.floor(
        (now.getTime() - new Date(move.moved_at).getTime()) / 86400000
      );
      const weekAgo = Math.floor(days / 7);
      if (weekAgo < 0 || weekAgo >= WEEKS_BACK) continue;
      const idx = WEEKS_BACK - 1 - weekAgo;
      const qty = Number(move.qty ?? 0);
      if (move.type === "out") buckets[idx].outQty += Math.abs(qty);
      else if (move.type === "in") buckets[idx].inQty += qty;
    }
    return buckets;
  }, [moves.result.data]);

  const trendOption = {
    color: [chart.palette[0], chart.palette[5]],
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
      data: trend.map((t) => t.label),
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
        name: "Received",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: trend.map((t) => t.inQty),
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
        name: "Issued",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: trend.map((t) => t.outQty),
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexA(chart.palette[5], 0.24) },
              { offset: 1, color: hexA(chart.palette[5], 0) },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">Inventory</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          On-hand stock across every warehouse, what's running low, and how goods
          are moving in and out.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          loading={loading}
          icon={Boxes}
          tone="text-blue-600 bg-blue-500/12 dark:text-blue-400"
          label="Active products"
          value={String(activeCount)}
          sub={`${products.result.data.length} total in catalog`}
        />
        <KpiCard
          loading={loading}
          icon={Boxes}
          tone="text-sky-600 bg-sky-500/12 dark:text-sky-400"
          label="Units on hand"
          value={formatNumber(totalUnits, locale)}
          sub="Across all warehouses"
        />
        <KpiCard
          loading={loading}
          icon={DollarSign}
          tone="text-emerald-600 bg-emerald-500/12 dark:text-emerald-400"
          label="Stock value"
          value={formatCurrency(totalValue, locale)}
          sub="On-hand units × unit price"
        />
        <KpiCard
          loading={loading}
          icon={AlertTriangle}
          tone="text-red-600 bg-red-500/12 dark:text-red-400"
          label="Low-stock items"
          value={String(lowStock.length)}
          sub="At or below reorder level"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock level by product</CardTitle>
            <CardDescription>
              On-hand units for the best-stocked products. Red bars are at or
              below reorder level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ReactECharts
                key={`stock-${chart.isDark}`}
                option={stockOption}
                style={{ height: 320 }}
                opts={{ renderer: "svg" }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low-stock alerts</CardTitle>
            <CardDescription>
              Active products at or below their reorder level — reorder these
              soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : lowStock.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
                <PackageX className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Everything is above its reorder level. Nice.
                </p>
              </div>
            ) : (
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {lowStock.map((e) => (
                  <button
                    type="button"
                    key={String(e.product.id)}
                    onClick={() =>
                      navigate(`${inventoryRoutes.products}/show/${e.product.id}`)
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {e.product.name || "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.product.sku || "—"} ·{" "}
                        {labelFor(CATEGORIES, e.product.category)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnumBadge value="out" label={`${e.qty} on hand`} />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        reorder {e.reorder}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock movement trend</CardTitle>
          <CardDescription>
            Units received vs issued over the last {WEEKS_BACK} weeks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ReactECharts
              key={`trend-${chart.isDark}`}
              option={trendOption}
              style={{ height: 288 }}
              opts={{ renderer: "svg" }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  loading,
}: {
  icon: typeof Boxes;
  tone: string;
  label: string;
  value: string;
  sub: string;
  loading: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              tone
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-24" />
        ) : (
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
