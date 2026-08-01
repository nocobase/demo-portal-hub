import { type HttpError, useList, useTranslate } from "@refinedev/core";
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
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES, type Option } from "../constants";
import { financeRoutes } from "../routes";
import type { Expense, ExpenseFormValues, UserRef } from "../types";

const DEFAULTS: ExpenseFormValues = {
  title: "",
  category: "travel",
  amount: "",
  spent_at: "",
  status: "pending",
  employee_id: "",
};

export function ExpenseCreate() {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New expense"
        description="Log an employee expense claim for review."
        closeLabel="Close"
        closeTo={financeRoutes.expenses}
        beforeClose={beforeClose}
      >
        <ExpenseForm mode="create" />
      </RouteDrawer>
      {confirmation}
    </>
  );
}

export function ExpenseEdit() {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit expense"
        description="Update the claim details or status."
        closeLabel="Close"
        closeTo={financeRoutes.expenses}
        beforeClose={beforeClose}
      >
        <ExpenseForm mode="edit" />
      </RouteDrawer>
      {confirmation}
    </>
  );
}

function ExpenseForm({ mode }: { mode: "create" | "edit" }) {
  const translate = useTranslate();
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<Expense, HttpError, ExpenseFormValues>({
    refineCoreProps: {
      resource: "hub_fin_expenses",
      action: mode,
      redirect: false,
      meta: { appends: ["employee"] },
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: DEFAULTS,
  });

  const { result: usersResult } = useList<UserRef>({
    resource: "users",
    pagination: { mode: "server", currentPage: 1, pageSize: 200 },
    errorNotification: false,
    queryOptions: { retry: false },
  });
  const users = usersResult?.data ?? [];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onFinish({
            ...values,
            amount: Number(values.amount) || 0,
            employee_id: values.employee_id ? Number(values.employee_id) : null,
          })
        )}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 [&_[data-slot=input]]:h-10 [&_[data-slot=select-trigger]]:h-10">
          <TextField form={form} name="title" label="Description" required placeholder="Flight to client kickoff" />
          <div className="grid grid-cols-2 gap-4">
            <OptionSelect form={form} name="category" label="Category" options={EXPENSE_CATEGORIES} />
            <TextField form={form} name="amount" label="Amount (USD)" type="number" required placeholder="0.00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField form={form} name="spent_at" label="Spent at" type="date" />
            <OptionSelect form={form} name="status" label="Status" options={EXPENSE_STATUSES} />
          </div>
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.nickname || user.username || user.email || `User ${user.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            {translate("buttons.cancel", "Cancel")}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving…"
              : mode === "create"
                ? "Create expense"
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
  form: UseFormReturn<ExpenseFormValues>;
  name: keyof ExpenseFormValues;
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

function OptionSelect({
  form,
  name,
  label,
  options,
}: {
  form: UseFormReturn<ExpenseFormValues>;
  name: keyof ExpenseFormValues;
  label: string;
  options: Option[];
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
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
