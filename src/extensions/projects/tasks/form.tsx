import { type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useEffect, useRef } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useParams } from "react-router";
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
import { TASK_PRIORITIES, TASK_STATUSES, labelFor, toDateInputValue } from "../constants";
import { ProjectPicker, UserPicker } from "../pickers";
import { useContextualCloseTo } from "../route-surfaces";
import type { TaskFormValues, TaskRecord } from "../types";

const toServerValues = (values: TaskFormValues) => {
  const { project_id, assignee_id, ...rest } = values;
  return {
    ...rest,
    project: project_id,
    assignee: assignee_id,
  } as unknown as TaskFormValues;
};

function TaskFormFields({
  form,
  presetProjectId,
  record,
}: {
  form: UseFormReturn<TaskFormValues>;
  presetProjectId?: string;
  record?: TaskRecord | null;
}) {
  const projectInitial = record?.project
    ? { value: String(record.project.id), label: record.project.name ?? "—" }
    : null;
  const assigneeInitial = record?.assignee
    ? {
        value: String(record.assignee.id),
        label: record.assignee.nickname || record.assignee.username || "—",
      }
    : null;

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        rules={{ required: "Task title is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Task</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. Migrate auth service"
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="project_id"
        rules={{ required: "Pick the project this task belongs to" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project</FormLabel>
            <FormControl
              render={
                <ProjectPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={Boolean(presetProjectId)}
                  initialOption={projectInitial}
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
                    value={field.value ?? "todo"}
                    onValueChange={(value) => field.onChange(value ?? "todo")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {labelFor(TASK_STATUSES, field.value ?? "todo")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((status) => (
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl
                render={
                  <Select
                    value={field.value ?? "med"}
                    onValueChange={(value) => field.onChange(value ?? "med")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {labelFor(TASK_PRIORITIES, field.value ?? "med")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
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

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="assignee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee</FormLabel>
              <FormControl
                render={
                  <UserPicker
                    value={field.value}
                    onChange={field.onChange}
                    initialOption={assigneeInitial}
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due date</FormLabel>
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
    </>
  );
}

type TaskSurfaceProps = { presetProjectId?: string };

export const TaskCreate = ({ presetProjectId }: TaskSurfaceProps) => {
  const closeTo = useContextualCloseTo();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New task"
        description="Add a task to the board."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <TaskCreateForm presetProjectId={presetProjectId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function TaskCreateForm({ presetProjectId }: TaskSurfaceProps) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<TaskRecord, HttpError, TaskFormValues>({
    refineCoreProps: {
      resource: "hub_pj_tasks",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      title: "",
      status: "todo",
      priority: "med",
      due_date: null,
      project_id: presetProjectId ? String(presetProjectId) : null,
      assignee_id: null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <TaskFormFields form={form} presetProjectId={presetProjectId} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add task"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const TaskEdit = ({
  presetProjectId,
  idParam = "id",
}: TaskSurfaceProps & { idParam?: string }) => {
  const params = useParams<Record<string, string>>();
  const recordId = params[idParam];
  const closeTo = useContextualCloseTo();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit task"
        description="Update status, priority and assignment."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <TaskEditForm recordId={recordId} presetProjectId={presetProjectId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function TaskEditForm({
  recordId,
  presetProjectId,
}: TaskSurfaceProps & { recordId?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish, query },
    ...form
  } = useForm<TaskRecord, HttpError, TaskFormValues>({
    refineCoreProps: {
      resource: "hub_pj_tasks",
      action: "edit",
      id: recordId,
      redirect: false,
      meta: { appends: ["project", "assignee"] },
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });

  const record = query?.data?.data;
  const seeded = useRef(false);
  useEffect(() => {
    if (!record || seeded.current) return;
    seeded.current = true;
    form.reset({
      title: record.title ?? "",
      status: record.status ?? "todo",
      priority: record.priority ?? "med",
      due_date: record.due_date ?? null,
      project_id: record.project ? String(record.project.id) : null,
      assignee_id: record.assignee ? String(record.assignee.id) : null,
    });
  }, [record, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <TaskFormFields
            form={form}
            presetProjectId={presetProjectId}
            record={record}
          />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}
