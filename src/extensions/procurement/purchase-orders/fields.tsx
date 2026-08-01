import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
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
import { PO_STATUSES, labelFor, toDateInputValue } from "../constants";
import { OwnerPicker, SupplierPicker } from "../pickers";
import type { PurchaseOrderFormValues, PurchaseOrderRecord } from "../types";

export function PurchaseOrderFormFields({
  form,
  record,
}: {
  form: UseFormReturn<PurchaseOrderFormValues>;
  record?: PurchaseOrderRecord | null;
}) {
  const supplierInitial = useMemo(
    () =>
      record?.supplier?.name
        ? { value: String(record.supplier.id), label: record.supplier.name }
        : null,
    [record]
  );
  const ownerInitial = useMemo(
    () =>
      record?.owner
        ? {
            value: String(record.owner.id),
            label:
              record.owner.nickname ||
              record.owner.username ||
              `User #${record.owner.id}`,
          }
        : null,
    [record]
  );

  return (
    <>
      <FormField
        control={form.control}
        name="po_number"
        rules={{ required: "PO number is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>PO number</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. PO-2049"
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="supplier_id"
        rules={{ required: "Pick the supplier this order is for" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplier</FormLabel>
            <FormControl
              render={
                <SupplierPicker
                  value={field.value}
                  onChange={field.onChange}
                  initialOption={supplierInitial}
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="owner_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Owner</FormLabel>
            <FormControl
              render={
                <OwnerPicker
                  value={field.value}
                  onChange={field.onChange}
                  initialOption={ownerInitial}
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl
                render={
                  <Select
                    value={field.value ?? "draft"}
                    onValueChange={(value) => field.onChange(value ?? "draft")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {labelFor(PO_STATUSES, field.value ?? "draft")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PO_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order date</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={toDateInputValue(field.value)}
                    type="date"
                    onChange={(event) => field.onChange(event.target.value || null)}
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="total"
        rules={{
          min: { value: 0, message: "Total cannot be negative" },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Order total</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  onChange={(event) =>
                    field.onChange(
                      event.target.value === ""
                        ? null
                        : Number(event.target.value)
                    )
                  }
                />
              }
            />
            <p className="text-xs text-muted-foreground">
              Add line items from the order detail to build up the total.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
