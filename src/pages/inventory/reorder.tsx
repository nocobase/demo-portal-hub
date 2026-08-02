import { useList, useTranslate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { AlertTriangle, PackageX } from "lucide-react";
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
import { useChartTheme } from "@/pages/home/theme";
import { CATEGORIES, formatNumber, labelFor } from "./constants";
import { useOnHandByProduct } from "./products/list";
import { inventoryRoutes } from "./routes";
import { EnumBadge, useLocale } from "./shared";
import type { ProductRecord } from "./types";

/** Suggested reorder quantity: enough to bring on-hand back to 2x the reorder level. */
function suggestedQty(qty: number, reorder: number): number {
  const target = reorder * 2;
  return Math.max(reorder - qty + Math.max(0, target - reorder), reorder - qty);
}

export function InventoryReorder() {
  const translate = useTranslate();
  const locale = useLocale();
  const chart = useChartTheme();
  const navigate = useNavigate();

  const products = useList<ProductRecord>({
    resource: "hub_inv_products",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    errorNotification: false,
    queryOptions: { retry: false },
  });
  const onHand = useOnHandByProduct();

  const loading = products.query.isLoading;

  const rows = useMemo(() => {
    return products.result.data
      .filter((product) => (product.status ?? "active") === "active")
      .map((product) => {
        const qty = onHand.get(String(product.id)) ?? 0;
        const reorder = Number(product.reorder_level ?? 0);
        const gap = reorder - qty;
        return {
          product,
          qty,
          reorder,
          gap,
          suggested: Math.max(1, suggestedQty(qty, reorder)),
        };
      })
      .filter((row) => row.qty <= row.reorder)
      .sort((a, b) => b.gap - a.gap);
  }, [products.result.data, onHand]);

  const topGaps = [...rows].slice(0, 12).reverse();

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

  const gapOption = {
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
      data: topGaps.map((r) => r.product.name ?? "—"),
      ...axisBase,
    },
    series: [
      {
        type: "bar",
        barWidth: 12,
        data: topGaps.map((r) => ({
          value: r.gap,
          itemStyle: {
            color: chart.palette[0],
            borderRadius: [0, 4, 4, 0],
          },
        })),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">
          {translate("inventory.reorder.title", { ns: "starter" }, "Reorder")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {translate(
            "inventory.reorder.description",
            { ns: "starter" },
            "Products at or below their reorder level, with a suggested quantity to bring stock back up."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {translate("inventory.reorder.kpi.lowStockCount", { ns: "starter" }, "Low-stock count")}
              </p>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-red-600 bg-red-500/12 dark:text-red-400">
                <AlertTriangle className="size-4" />
              </span>
            </div>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : (
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {String(rows.length)}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {translate(
                "inventory.reorder.kpi.lowStockCount.sub",
                { ns: "starter" },
                "Active products at or below reorder level"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {translate("inventory.reorder.gapChart.title", { ns: "starter" }, "Biggest reorder gaps")}
          </CardTitle>
          <CardDescription>
            {translate(
              "inventory.reorder.gapChart.description",
              { ns: "starter" },
              "How far each product's on-hand quantity is below its reorder level."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-80 w-full" />
          ) : topGaps.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
              <PackageX className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {translate(
                  "inventory.reorder.empty",
                  { ns: "starter" },
                  "Nothing to reorder — every active product is above its reorder level."
                )}
              </p>
            </div>
          ) : (
            <ReactECharts
              key={`gap-${chart.isDark}`}
              option={gapOption}
              style={{ height: 320 }}
              opts={{ renderer: "svg" }}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {translate("inventory.reorder.list.title", { ns: "starter" }, "Products to reorder")}
          </CardTitle>
          <CardDescription>
            {translate(
              "inventory.reorder.list.description",
              { ns: "starter" },
              "Click a row to open the product details."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-80 w-full" />
          ) : rows.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <PackageX className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {translate(
                  "inventory.reorder.empty",
                  { ns: "starter" },
                  "Nothing to reorder — every active product is above its reorder level."
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-2 py-2 font-medium">
                      {translate("inventory.reorder.list.product", { ns: "starter" }, "Product")}
                    </th>
                    <th className="px-2 py-2 font-medium">
                      {translate("inventory.reorder.list.category", { ns: "starter" }, "Category")}
                    </th>
                    <th className="px-2 py-2 text-right font-medium">
                      {translate("inventory.reorder.list.onHand", { ns: "starter" }, "On hand")}
                    </th>
                    <th className="px-2 py-2 text-right font-medium">
                      {translate("inventory.reorder.list.reorderLevel", { ns: "starter" }, "Reorder level")}
                    </th>
                    <th className="px-2 py-2 text-right font-medium">
                      {translate("inventory.reorder.list.suggestedQty", { ns: "starter" }, "Suggested qty")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={String(row.product.id)}
                      className="cursor-pointer border-b last:border-0 hover:bg-accent"
                      onClick={() =>
                        navigate(`${inventoryRoutes.products}/show/${row.product.id}`)
                      }
                    >
                      <td className="px-2 py-2">
                        <p className="font-medium">{row.product.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.product.sku || "—"}
                        </p>
                      </td>
                      <td className="px-2 py-2">
                        <EnumBadge
                          value={row.product.category}
                          label={labelFor(CATEGORIES, row.product.category, translate)}
                        />
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-red-600 dark:text-red-400">
                        {formatNumber(row.qty, locale)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                        {formatNumber(row.reorder, locale)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums font-medium">
                        {formatNumber(row.suggested, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
