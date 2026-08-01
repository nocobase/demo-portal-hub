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
import { Textarea } from "@/components/ui/textarea";
import { LEAVE_STATUSES, LEAVE_TYPES, labelFor, toDateInputValue } from "../constants";
import { EmployeePicker } from "../pickers";
import type { LeaveRequestFormValues } from "../types";

export function LeaveFormFields({
  form,
}: {
  form: UseFormReturn<LeaveRequestFormValues>;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="employee_id"
        rules={{ required: "Pick the employee taking leave" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employee</FormLabel>
            <FormControl
              render={
                <EmployeePicker value={field.value} onChange={field.onChange} />
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
                    value={field.value ?? "annual"}
                    onValueChange={(value) => field.onChange(value ?? "annual")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type">
                        {labelFor(LEAVE_TYPES, field.value ?? "annual")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl
                render={
                  <Select
                    value={field.value ?? "pending"}
                    onValueChange={(value) => field.onChange(value ?? "pending")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status">
                        {labelFor(LEAVE_STATUSES, field.value ?? "pending")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_STATUSES.map((status) => (
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
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start date</FormLabel>
              <FormControl
                render={
                  <Input
                    type="date"
                    value={toDateInputValue(field.value)}
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
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End date</FormLabel>
              <FormControl
                render={
                  <Input
                    type="date"
                    value={toDateInputValue(field.value)}
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
          name="days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Days</FormLabel>
              <FormControl
                render={
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={field.value ?? ""}
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
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reason</FormLabel>
            <FormControl
              render={
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Context for the approver"
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
