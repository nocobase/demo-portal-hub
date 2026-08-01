import { useMemo } from "react";
import { type UseFormReturn } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { MOVE_TYPES, labelFor, toDateTimeInputValue } from "../constants";
import { ProductPicker, WarehousePicker } from "../pickers";
import type { StockMoveFormValues, StockMoveRecord } from "../types";

export function StockMoveFormFields({
  form,
  presetProductId,
  record,
}: {
  form: UseFormReturn<StockMoveFormValues>;
  presetProductId?: string;
  record?: StockMoveRecord | null;
}) {
  const productInitial = useMemo(
    () =>
      record?.product?.name
        ? {
            value: String(record.product.id),
            label: record.product.sku
              ? `${record.product.name} (${record.product.sku})`
              : record.product.name,
          }
        : null,
    [record]
  );
  const warehouseInitial = useMemo(
    () =>
      record?.warehouse?.name
        ? { value: String(record.warehouse.id), label: record.warehouse.name }
        : null,
    [record]
  );

  return (
    <>
      <FormField
        control={form.control}
        name="product_id"
        rules={{ required: "Pick the product this move is for" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <FormControl
              render={
                <ProductPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={Boolean(presetProductId)}
                  initialOption={productInitial}
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="warehouse_id"
        rules={{ required: "Pick a warehouse" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Warehouse</FormLabel>
            <FormControl
              render={
                <WarehousePicker
                  value={field.value}
                  onChange={field.onChange}
                  initialOption={warehouseInitial}
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl
                render={
                  <Select
                    value={field.value ?? "in"}
                    onValueChange={(value) => field.onChange(value ?? "in")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {labelFor(MOVE_TYPES, field.value ?? "in")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {MOVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
          name="qty"
          rules={{ required: "Enter the quantity" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    step="1"
                    placeholder="e.g. 24"
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="moved_at"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moved at</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={toDateTimeInputValue(field.value)}
                  type="datetime-local"
                  onChange={(event) =>
                    field.onChange(event.target.value || null)
                  }
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note</FormLabel>
            <FormControl
              render={
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Reference, reason, PO number..."
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
