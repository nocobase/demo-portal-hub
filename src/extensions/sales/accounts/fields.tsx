import type { UseFormReturn } from "react-hook-form";
import { useMemo } from "react";
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
import { INDUSTRIES, labelFor } from "../constants";
import { OwnerPicker } from "../pickers";
import type { AccountFormValues, AccountRecord } from "../types";

export function AccountFormFields({
  form,
  record,
}: {
  form: UseFormReturn<AccountFormValues>;
  record?: AccountRecord | null;
}) {
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
        name="name"
        rules={{ required: "Account name is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account name</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. Northwind Traders"
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
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl
                render={
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) => field.onChange(value || null)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select industry">
                        {field.value
                          ? labelFor(INDUSTRIES, field.value)
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
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
      </div>

      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="https://example.com"
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
