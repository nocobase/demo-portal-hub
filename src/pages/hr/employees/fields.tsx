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
import { EMPLOYEE_STATUSES, labelFor, toDateInputValue } from "../constants";
import { DepartmentPicker, EmployeePicker } from "../pickers";
import type { EmployeeFormValues } from "../types";

export function EmployeeFormFields({
  form,
  employeeId,
}: {
  form: UseFormReturn<EmployeeFormValues>;
  employeeId?: string;
}) {
  const translate = useTranslate();
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        rules={{
          required: translate(
            "hr.employees.form.nameRequired",
            { ns: "starter" },
            "Full name is required"
          ),
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {translate("hr.employees.fields.fullName", { ns: "starter" }, "Full name")}
            </FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={translate(
                    "hr.employees.form.namePlaceholder",
                    { ns: "starter" },
                    "e.g. Grace Okafor"
                  )}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {translate("hr.employees.fields.email", { ns: "starter" }, "Email")}
              </FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="email"
                    placeholder={translate(
                      "hr.employees.form.emailPlaceholder",
                      { ns: "starter" },
                      "name@company.com"
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
          name="job_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {translate("hr.employees.fields.title", { ns: "starter" }, "Title")}
              </FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={translate(
                      "hr.employees.form.titlePlaceholder",
                      { ns: "starter" },
                      "e.g. Backend Engineer"
                    )}
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {translate("hr.employees.fields.status", { ns: "starter" }, "Status")}
              </FormLabel>
              <FormControl
                render={
                  <Select
                    value={field.value ?? "active"}
                    onValueChange={(value) => field.onChange(value ?? "active")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={translate(
                          "hr.employees.form.statusPlaceholder",
                          { ns: "starter" },
                          "Select status"
                        )}
                      >
                        {labelFor(EMPLOYEE_STATUSES, field.value ?? "active", translate)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {labelFor(EMPLOYEE_STATUSES, status.value, translate)}
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
          name="hire_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {translate("hr.employees.fields.hireDate", { ns: "starter" }, "Hire date")}
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
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {translate("hr.employees.fields.department", { ns: "starter" }, "Department")}
              </FormLabel>
              <FormControl
                render={
                  <DepartmentPicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manager_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {translate("hr.employees.fields.manager", { ns: "starter" }, "Manager")}
              </FormLabel>
              <FormControl
                render={
                  <EmployeePicker
                    value={field.value}
                    onChange={field.onChange}
                    excludeId={employeeId}
                    placeholder={translate(
                      "hr.employees.form.managerPlaceholder",
                      { ns: "starter" },
                      "Reports to..."
                    )}
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
