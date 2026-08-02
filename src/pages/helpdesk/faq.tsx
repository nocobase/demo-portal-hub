import { useList, useTranslate } from "@refinedev/core";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { FaqRecord } from "./types";

const RESOURCE = "hub_hd_faqs";

// ---------------------------------------------------------------------------
// FAQ / self-service — a search box over an accordion grouped by category.
// Read-only, no drawers: the whole point is a fast scan-and-answer surface.
// ---------------------------------------------------------------------------

export function FaqPage() {
  const translate = useTranslate();
  const [search, setSearch] = useState("");

  const { result, query } = useList<FaqRecord>({
    resource: RESOURCE,
    pagination: { mode: "server", currentPage: 1, pageSize: 200 },
    sorters: [{ field: "category", order: "asc" }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const faqs = result.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question?.toLowerCase().includes(term) ||
        faq.answer?.toLowerCase().includes(term) ||
        faq.category?.toLowerCase().includes(term)
    );
  }, [faqs, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, FaqRecord[]>();
    const otherLabel = translate("helpdesk.faq.categoryOther", { ns: "starter" }, "Other");
    for (const faq of filtered) {
      const key = faq.category?.trim() || otherLabel;
      const bucket = map.get(key);
      if (bucket) bucket.push(faq);
      else map.set(key, [faq]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered, translate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center text-muted-foreground">
          <Breadcrumb />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {translate("helpdesk.faq.title", { ns: "starter" }, "Frequently asked questions")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {translate(
              "helpdesk.faq.subtitle",
              { ns: "starter" },
              "Quick answers to the questions the helpdesk sees most often."
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={translate(
              "helpdesk.faq.search.placeholder",
              { ns: "starter" },
              "Search questions and answers..."
            )}
            className="pl-9"
          />
        </div>
        {search.trim() ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {translate(
              "helpdesk.faq.resultCount",
              { ns: "starter", count: filtered.length },
              `${filtered.length} results`
            )}
          </span>
        ) : null}
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/70 px-3 py-10 text-center text-sm text-muted-foreground">
          {translate("helpdesk.faq.empty", { ns: "starter" }, "No questions match your search.")}
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
              <Accordion multiple className="rounded-xl border border-border/70 px-2">
                {items.map((faq) => (
                  <AccordionItem key={faq.id} value={String(faq.id)}>
                    <AccordionTrigger className="px-4 text-sm font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
