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
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { ASSET_CATEGORIES, ASSET_STATUSES, labelFor } from "../constants";
import type { AssetFormValues } from "../types";

export function AssetFormFields({
  form,
}: {
  form: UseFormReturn<AssetFormValues>;
}) {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="tag"
          rules={{ required: "Asset tag is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset tag</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="e.g. AS-1024"
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder='e.g. MacBook Pro 16"'
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl
                render={
                  <NativeSelect
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                  >
                    <NativeSelectOption value="">Unspecified</NativeSelectOption>
                    {ASSET_CATEGORIES.map((category) => (
                      <NativeSelectOption key={category.value} value={category.value}>
                        {labelFor(ASSET_CATEGORIES, category.value)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl
                render={
                  <NativeSelect
                    {...field}
                    value={field.value ?? "in_stock"}
                    onChange={(event) =>
                      field.onChange(event.target.value || "in_stock")
                    }
                  >
                    {ASSET_STATUSES.map((status) => (
                      <NativeSelectOption key={status.value} value={status.value}>
                        {labelFor(ASSET_STATUSES, status.value)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase date</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                    type="date"
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value (USD)</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? null
                          : Number(event.target.value)
                      )
                    }
                    type="number"
                    min={0}
                    step="1"
                    placeholder="0"
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
