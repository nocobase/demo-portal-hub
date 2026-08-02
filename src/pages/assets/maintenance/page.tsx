import { useList, useTranslate } from "@refinedev/core";
import ReactECharts from "echarts-for-react";
import { AlertTriangle, Wrench } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { LoadingState } from "@/components/app-shell/loading-state";
import { ListView } from "@/components/resources/views/list-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useChartTheme } from "@/pages/home/theme";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  categoryBadgeClass,
  formatCurrency,
  formatDate,
  labelFor,
  statusBadgeClass,
} from "../constants";
import { getAssetShowPath } from "../routes";
import { EmptyRow, Pill, SimpleTable, useLocale } from "../shared";
import type { AssetRecord } from "../types";

// Assets older than this are flagged for a warranty/lifecycle check when no
// explicit warranty field is set — a lightweight proxy that avoids schema
// churn for a virtual, read-only view.
const AGING_YEARS = 3;

const ageInYears = (purchaseDate: string | null | undefined) => {
  if (!purchaseDate) return null;
  const purchased = new Date(purchaseDate);
  if (Number.isNaN(purchased.getTime())) return null;
  return (Date.now() - purchased.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
};

export function MaintenancePage() {
  const translate = useTranslate();
  const locale = useLocale();
  const chart = useChartTheme();
  const navigate = useNavigate();

  const { result, query } = useList<AssetRecord>({
    resource: "hub_as_assets",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const { inRepair, aging, statusOption } = useMemo(() => {
    const assets = result.data;
    const inRepair = assets.filter((asset) => asset.status === "repair");
    const aging = assets
      .filter((asset) => asset.status !== "retired" && asset.status !== "repair")
      .filter((asset) => {
        const age = ageInYears(asset.purchase_date);
        return age !== null && age >= AGING_YEARS;
      })
      .sort((a, b) => (ageInYears(b.purchase_date) ?? 0) - (ageInYears(a.purchase_date) ?? 0));

    const byStatus: Record<string, number> = {};
    for (const asset of assets) {
      const status = asset.status ?? "in_stock";
      byStatus[status] = (byStatus[status] ?? 0) + 1;
    }
    const statusData = ASSET_STATUSES.map((status) => ({
      name: labelFor(ASSET_STATUSES, status.value, translate),
      value: byStatus[status.value] ?? 0,
    }));

    const axisBase = {
      axisLine: { lineStyle: { color: chart.grid } },
      axisTick: { show: false },
      axisLabel: { color: chart.axis, fontSize: 12 },
    };
    const statusOption = {
      color: [chart.palette[0]],
      grid: { left: 6, right: 12, top: 16, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: chart.tooltipBg,
        borderColor: chart.tooltipBorder,
        textStyle: { color: chart.tooltipText, fontSize: 12 },
        borderWidth: 1,
        padding: [8, 12],
      },
      xAxis: { type: "category", data: statusData.map((d) => d.name), ...axisBase },
      yAxis: {
        type: "value",
        ...axisBase,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: chart.grid } },
        minInterval: 1,
      },
      series: [
        {
          name: translate("assets.charts.seriesAssets", { ns: "starter" }, "Assets"),
          type: "bar",
          data: statusData.map((d) => d.value),
          barWidth: 26,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
        },
      ],
    };

    return { inRepair, aging, statusOption };
  }, [result.data, chart, translate]);

  const openAsset = (id: AssetRecord["id"]) => navigate(getAssetShowPath(id));

  return (
    <ListView resource="hub_as_assets">
      {query.isLoading ? (
        <LoadingState className="min-h-64" />
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>
            {translate(
              "assets.maintenance.loadError.title",
              { ns: "starter" },
              "Unable to load maintenance data"
            )}
          </AlertTitle>
          <AlertDescription>
            {translate(
              "assets.maintenance.loadError.description",
              { ns: "starter" },
              "Check your connection and try again."
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {translate("assets.maintenance.chart.title", { ns: "starter" }, "Fleet by status")}
              </CardTitle>
              <CardDescription>
                {translate(
                  "assets.maintenance.chart.description",
                  { ns: "starter" },
                  "Where every device sits — repair and aging assets need a closer look."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReactECharts
                key={`as-maint-status-${chart.isDark}`}
                option={statusOption}
                style={{ height: 240 }}
                opts={{ renderer: "svg" }}
              />
            </CardContent>
          </Card>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Wrench className="size-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-medium">
                {translate(
                  "assets.maintenance.repair.title",
                  { ns: "starter" },
                  "In repair"
                )}
              </h3>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                {inRepair.length}
              </span>
            </div>
            <SimpleTable
              headers={[
                translate("assets.assets.fields.tag", { ns: "starter" }, "Tag"),
                translate("assets.assets.fields.name", { ns: "starter" }, "Name"),
                translate("assets.assets.fields.category", { ns: "starter" }, "Category"),
                translate("assets.assets.fields.value", { ns: "starter" }, "Value"),
                translate("assets.assets.fields.purchaseDate", { ns: "starter" }, "Purchase date"),
              ]}
            >
              {inRepair.length === 0 ? (
                <EmptyRow
                  colSpan={5}
                  text={translate(
                    "assets.maintenance.repair.empty",
                    { ns: "starter" },
                    "Nothing is in repair right now."
                  )}
                />
              ) : (
                inRepair.map((asset) => (
                  <tr
                    key={String(asset.id)}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => openAsset(asset.id)}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {asset.tag || "—"}
                    </td>
                    <td className="px-3 py-2 font-medium">{asset.name || "—"}</td>
                    <td className="px-3 py-2">
                      {asset.category ? (
                        <Pill
                          label={labelFor(ASSET_CATEGORIES, asset.category, translate)}
                          className={categoryBadgeClass(asset.category)}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatCurrency(asset.value, locale)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDate(asset.purchase_date, locale)}
                    </td>
                  </tr>
                ))
              )}
            </SimpleTable>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-medium">
                {translate(
                  "assets.maintenance.aging.title",
                  { ns: "starter" },
                  "Aging — warranty check recommended"
                )}
              </h3>
              <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                {aging.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {translate(
                "assets.maintenance.aging.hint",
                { ns: "starter" },
                "Devices purchased more than 3 years ago, in stock or assigned — no explicit warranty field, so age is used as a proxy."
              )}
            </p>
            <SimpleTable
              headers={[
                translate("assets.assets.fields.tag", { ns: "starter" }, "Tag"),
                translate("assets.assets.fields.name", { ns: "starter" }, "Name"),
                translate("assets.assets.fields.status", { ns: "starter" }, "Status"),
                translate("assets.assets.fields.purchaseDate", { ns: "starter" }, "Purchase date"),
                translate("assets.maintenance.aging.headers.age", { ns: "starter" }, "Age"),
              ]}
            >
              {aging.length === 0 ? (
                <EmptyRow
                  colSpan={5}
                  text={translate(
                    "assets.maintenance.aging.empty",
                    { ns: "starter" },
                    "No aging assets — the fleet is fresh."
                  )}
                />
              ) : (
                aging.map((asset) => {
                  const age = ageInYears(asset.purchase_date);
                  return (
                    <tr
                      key={String(asset.id)}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => openAsset(asset.id)}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {asset.tag || "—"}
                      </td>
                      <td className="px-3 py-2 font-medium">{asset.name || "—"}</td>
                      <td className="px-3 py-2">
                        <Pill
                          label={labelFor(ASSET_STATUSES, asset.status ?? "in_stock", translate)}
                          className={statusBadgeClass(asset.status ?? "in_stock")}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatDate(asset.purchase_date, locale)}
                      </td>
                      <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                        {age !== null
                          ? translate(
                              "assets.maintenance.aging.yearsValue",
                              { ns: "starter", count: Math.floor(age) },
                              `${Math.floor(age)}y`
                            )
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </SimpleTable>
          </section>
        </div>
      )}
    </ListView>
  );
}
