import { type useTranslate } from "@refinedev/core";
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
import { Textarea } from "@/components/ui/textarea";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  labelFor,
} from "../constants";
import { UserPicker } from "../pickers";
import type { TicketFormValues } from "../types";

type Translate = ReturnType<typeof useTranslate>;

export function TicketFormFields({
  form,
  translate,
}: {
  form: UseFormReturn<TicketFormValues>;
  translate: Translate;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="subject"
        rules={{ required: "Subject is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Short summary of the issue"
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl
              render={
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Describe the problem, steps to reproduce, and impact"
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
                    {TICKET_CATEGORIES.map((option) => (
                      <NativeSelectOption key={option.value} value={option.value}>
                        {labelFor(TICKET_CATEGORIES, option.value, translate)}
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl
                render={
                  <NativeSelect
                    {...field}
                    value={field.value ?? "med"}
                    onChange={(event) =>
                      field.onChange(event.target.value || "med")
                    }
                  >
                    {TICKET_PRIORITIES.map((option) => (
                      <NativeSelectOption key={option.value} value={option.value}>
                        {labelFor(TICKET_PRIORITIES, option.value, translate)}
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
                  value={field.value ?? "open"}
                  onChange={(event) =>
                    field.onChange(event.target.value || "open")
                  }
                >
                  {TICKET_STATUSES.map((option) => (
                    <NativeSelectOption key={option.value} value={option.value}>
                      {labelFor(TICKET_STATUSES, option.value, translate)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="requesterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requester</FormLabel>
              <FormControl
                render={
                  <UserPicker
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="Who raised this ticket?"
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assigneeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee</FormLabel>
              <FormControl
                render={
                  <UserPicker
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder="Assign an agent"
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
