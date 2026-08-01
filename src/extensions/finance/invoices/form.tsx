import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import type { UseFormReturn } from "react-hook-form";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
  useRouteSurfaceClose,
} from "@/extensions/nocobase-route-surfaces";
import { INVOICE_STATUSES } from "../constants";
import { financeRoutes } from "../routes";
import type { Invoice, InvoiceFormValues } from "../types";

const DEFAULTS: InvoiceFormValues = {
  invoice_number: "",
  client_name: "",
  amount: "",
  issue_date: "",
  due_date: "",
  status: "draft",
};

export function InvoiceCreate() {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New invoice"
        description="Issue a new invoice to a client."
        closeLabel="Close"
        closeTo={financeRoutes.invoices}
        beforeClose={beforeClose}
      >
        <InvoiceForm mode="create" />
      </RouteDrawer>
      {confirmation}
    </>
  );
}

export function InvoiceEdit() {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit invoice"
        description="Update invoice details or status."
        closeLabel="Close"
        closeTo={financeRoutes.invoices}
        beforeClose={beforeClose}
      >
        <InvoiceForm mode="edit" />
      </RouteDrawer>
      {confirmation}
    </>
  );
}

function InvoiceForm({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<Invoice, HttpError, InvoiceFormValues>({
    refineCoreProps: {
      resource: "hub_fin_invoices",
      action: mode,
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: DEFAULTS,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onFinish({ ...values, amount: Number(values.amount) || 0 })
        )}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 [&_[data-slot=input]]:h-10 [&_[data-slot=select-trigger]]:h-10">
          <TextField form={form} name="invoice_number" label="Invoice #" required placeholder="INV-1042" />
          <TextField form={form} name="client_name" label="Client" required placeholder="Acme Corp" />
          <TextField form={form} name="amount" label="Amount (USD)" type="number" required placeholder="0.00" />
          <div className="grid grid-cols-2 gap-4">
            <TextField form={form} name="issue_date" label="Issue date" type="date" />
            <TextField form={form} name="due_date" label="Due date" type="date" />
          </div>
          <StatusField form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            {translate("buttons.cancel", "Cancel")}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving…"
              : mode === "create"
                ? "Create invoice"
                : "Save changes"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

function TextField({
  form,
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  form: UseFormReturn<InvoiceFormValues>;
  name: keyof InvoiceFormValues;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      rules={required ? { required: `${label} is required` } : undefined}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl
            render={
              <Input
                {...field}
                value={field.value ?? ""}
                type={type}
                placeholder={placeholder}
              />
            }
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function StatusField({ form }: { form: UseFormReturn<InvoiceFormValues> }) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_STATUSES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
