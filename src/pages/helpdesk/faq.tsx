import { type HttpError, useList, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useParams } from "react-router";
import { Breadcrumb } from "@/components/app-shell/breadcrumb";
import { DeleteButton } from "@/components/resources/buttons/delete";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useRouteSurfaceClose } from "@nocobase/portal-sdk/routing";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
} from "@/extensions/nocobase-route-surfaces";
import { getFaqEditPath, helpdeskRoutes } from "./routes";
import type { FaqFormValues, FaqRecord } from "./types";

const RESOURCE = "hub_hd_faqs";

export function FaqPage() {
  return (
    <>
      <FaqContent />
      <Outlet />
    </>
  );
}

// ---------------------------------------------------------------------------
// FAQ / self-service — a search box over an accordion grouped by category.
// Read-only, no drawers: the whole point is a fast scan-and-answer surface.
// ---------------------------------------------------------------------------

function FaqContent() {
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
          <Button render={<Link to={helpdeskRoutes.faqCreate} />}>
            <Plus className="size-4" />
            {translate("helpdesk.faq.new", { ns: "starter" }, "New question")}
          </Button>
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
                    <AccordionContent className="px-4 text-sm leading-6 text-muted-foreground">
                      <p className="whitespace-pre-wrap">{faq.answer}</p>
                      <div className="mt-3 flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link to={getFaqEditPath(faq.id)} />}
                        >
                          <Pencil className="size-3.5" />
                          {translate("helpdesk.faq.edit", { ns: "starter" }, "Edit")}
                        </Button>
                        <DeleteButton
                          resource={RESOURCE}
                          recordItemId={faq.id}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                          {translate("helpdesk.faq.delete", { ns: "starter" }, "Delete")}
                        </DeleteButton>
                      </div>
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

// ---------------------------------------------------------------------------
// Create / edit drawers — URL-addressable at /faq/create and /faq/edit/:id.
// FAQ entries are a maintained collection; admins add and revise them here.
// ---------------------------------------------------------------------------

function FaqFormFields({
  form,
}: {
  form: ReturnType<typeof useForm<FaqRecord, HttpError, FaqFormValues>>;
}) {
  const translate = useTranslate();
  return (
    <>
      <FormField
        control={form.control}
        name="question"
        rules={{
          required: translate(
            "helpdesk.faq.fields.question.required",
            { ns: "starter" },
            "Question is required"
          ),
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {translate("helpdesk.faq.fields.question", { ns: "starter" }, "Question")}
            </FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={translate(
                    "helpdesk.faq.fields.question.placeholder",
                    { ns: "starter" },
                    "e.g. How do I reset my password?"
                  )}
                  autoFocus
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="answer"
        rules={{
          required: translate(
            "helpdesk.faq.fields.answer.required",
            { ns: "starter" },
            "Answer is required"
          ),
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {translate("helpdesk.faq.fields.answer", { ns: "starter" }, "Answer")}
            </FormLabel>
            <FormControl
              render={
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  className="min-h-32"
                  placeholder={translate(
                    "helpdesk.faq.fields.answer.placeholder",
                    { ns: "starter" },
                    "Write a clear, self-service answer."
                  )}
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {translate("helpdesk.faq.fields.category", { ns: "starter" }, "Category")}
            </FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(event.target.value || null)}
                  placeholder={translate(
                    "helpdesk.faq.fields.category.placeholder",
                    { ns: "starter" },
                    "e.g. Accounts"
                  )}
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function FaqCreate() {
  const translate = useTranslate();
  const close = useRouteSurfaceClose();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  const form = useForm<FaqRecord, HttpError, FaqFormValues>({
    refineCoreProps: {
      resource: RESOURCE,
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: { question: "", answer: "", category: null },
  });
  const {
    refineCore: { onFinish },
  } = form;

  return (
    <>
      <RouteDrawer
        title={translate("helpdesk.faq.create.title", { ns: "starter" }, "New question")}
        description={translate(
          "helpdesk.faq.create.description",
          { ns: "starter" },
          "Add a self-service answer to the knowledge base."
        )}
        closeLabel={translate("buttons.close", "Close")}
        closeTo={helpdeskRoutes.faq}
        beforeClose={beforeClose}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => onFinish(values))}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <FaqFormFields form={form} />
            </div>
            <RouteDrawerFooter className="flex-row justify-end">
              <Button type="button" variant="outline" onClick={() => close()}>
                {translate("buttons.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? translate("helpdesk.faq.create.submitting", { ns: "starter" }, "Creating...")
                  : translate("helpdesk.faq.create.submit", { ns: "starter" }, "Create question")}
              </Button>
            </RouteDrawerFooter>
          </form>
        </Form>
      </RouteDrawer>
      {confirmation}
    </>
  );
}

export function FaqEdit() {
  const translate = useTranslate();
  const { id } = useParams<{ id: string }>();
  const close = useRouteSurfaceClose();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  const form = useForm<FaqRecord, HttpError, FaqFormValues>({
    refineCoreProps: {
      resource: RESOURCE,
      action: "edit",
      id,
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });
  const {
    refineCore: { onFinish, query },
  } = form;

  const record = query?.data?.data;
  const seeded = useRef(false);
  useEffect(() => {
    if (!record || seeded.current) return;
    seeded.current = true;
    form.reset({
      question: record.question ?? "",
      answer: record.answer ?? "",
      category: record.category ?? null,
    });
  }, [record, form]);

  return (
    <>
      <RouteDrawer
        title={translate("helpdesk.faq.edit.title", { ns: "starter" }, "Edit question")}
        description={translate(
          "helpdesk.faq.edit.description",
          { ns: "starter" },
          "Update the question, answer or category."
        )}
        closeLabel={translate("buttons.close", "Close")}
        closeTo={helpdeskRoutes.faq}
        beforeClose={beforeClose}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => onFinish(values))}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <FaqFormFields form={form} />
            </div>
            <RouteDrawerFooter className="flex-row justify-end">
              <Button type="button" variant="outline" onClick={() => close()}>
                {translate("buttons.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? translate("helpdesk.faq.edit.submitting", { ns: "starter" }, "Saving...")
                  : translate("helpdesk.faq.edit.submit", { ns: "starter" }, "Save changes")}
              </Button>
            </RouteDrawerFooter>
          </form>
        </Form>
      </RouteDrawer>
      {confirmation}
    </>
  );
}
