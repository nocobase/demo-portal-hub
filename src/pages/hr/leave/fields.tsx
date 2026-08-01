import { useTranslate } from "@refinedev/core";
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
  const translate = useTranslate();
  return (
    <>
      <FormField
        control={form.control}
        name="employee_id"
        rules={{
          required: translate(
            "hr.leave.form.employeeRequired",
            { ns: "starter" },
            "Pick the employee taking leave"
          ),
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {translate("hr.leave.fields.employee", { ns: "starter" }, "Employee")}
            </FormLabel>
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
              <FormLabel>
                {translate("hr.leave.fields.type", { ns: "starter" }, "Type")}
              </FormLabel>
              <FormControl
                render={
                  <Select
                    value={field.value ?? "annual"}
                    onValueChange={(value) => field.onChange(value ?? "annual")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={translate(
                          "hr.leave.form.typePlaceholder",
                          { ns: "starter" },
                          "Select type"
                        )}
                      >
                        {labelFor(LEAVE_TYPES, field.value ?? "annual", translate)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {labelFor(LEAVE_TYPES, type.value, translate)}
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
              <FormLabel>
                {translate("hr.leave.fields.status", { ns: "starter" }, "Status")}
              </FormLabel>
              <FormControl
                render={
                  <Select
                    value={field.value ?? "pending"}
                    onValueChange={(value) => field.onChange(value ?? "pending")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={translate(
                          "hr.leave.form.statusPlaceholder",
                          { ns: "starter" },
                          "Select status"
                        )}
                      >
                        {labelFor(LEAVE_STATUSES, field.value ?? "pending", translate)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {labelFor(LEAVE_STATUSES, status.value, translate)}
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
              <FormLabel>
                {translate("hr.leave.fields.startDate", { ns: "starter" }, "Start date")}
              </FormLabel>
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
              <FormLabel>
                {translate("hr.leave.fields.endDate", { ns: "starter" }, "End date")}
              </FormLabel>
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
              <FormLabel>
                {translate("hr.leave.fields.days", { ns: "starter" }, "Days")}
              </FormLabel>
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
            <FormLabel>
              {translate("hr.leave.fields.reason", { ns: "starter" }, "Reason")}
            </FormLabel>
            <FormControl
              render={
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder={translate(
                    "hr.leave.form.reasonPlaceholder",
                    { ns: "starter" },
                    "Context for the approver"
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
