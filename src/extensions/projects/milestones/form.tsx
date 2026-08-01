import { type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useEffect, useRef } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
  useRouteSurfaceClose,
} from "@/extensions/nocobase-route-surfaces";
import { toDateInputValue } from "../constants";
import { ProjectPicker } from "../pickers";
import { useContextualCloseTo } from "../route-surfaces";
import type { MilestoneFormValues, MilestoneRecord } from "../types";

const toServerValues = (values: MilestoneFormValues) => {
  const { project_id, ...rest } = values;
  return { ...rest, project: project_id } as unknown as MilestoneFormValues;
};

function MilestoneFormFields({
  form,
  presetProjectId,
  record,
}: {
  form: UseFormReturn<MilestoneFormValues>;
  presetProjectId?: string;
  record?: MilestoneRecord | null;
}) {
  const projectInitial = record?.project
    ? { value: String(record.project.id), label: record.project.name ?? "—" }
    : null;

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        rules={{ required: "Milestone name is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Milestone</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. Production launch"
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
        rules={{ required: "Pick the project this milestone belongs to" }}
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

      <FormField
        control={form.control}
        name="due_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target date</FormLabel>
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

      <FormField
        control={form.control}
        name="done"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border p-4">
            <FormControl
              render={
                <Checkbox
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                />
              }
            />
            <div className="space-y-0.5">
              <FormLabel className="cursor-pointer">Completed</FormLabel>
              <p className="text-xs text-muted-foreground">
                Mark this milestone as reached.
              </p>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}

type MilestoneSurfaceProps = { presetProjectId?: string };

export const MilestoneCreate = ({ presetProjectId }: MilestoneSurfaceProps) => {
  const closeTo = useContextualCloseTo();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New milestone"
        description="Add a milestone to track a key date."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <MilestoneCreateForm presetProjectId={presetProjectId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function MilestoneCreateForm({ presetProjectId }: MilestoneSurfaceProps) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<MilestoneRecord, HttpError, MilestoneFormValues>({
    refineCoreProps: {
      resource: "hub_pj_milestones",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      name: "",
      due_date: null,
      done: false,
      project_id: presetProjectId ? String(presetProjectId) : null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <MilestoneFormFields form={form} presetProjectId={presetProjectId} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add milestone"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const MilestoneEdit = ({
  presetProjectId,
  idParam = "id",
}: MilestoneSurfaceProps & { idParam?: string }) => {
  const params = useParams<Record<string, string>>();
  const recordId = params[idParam];
  const closeTo = useContextualCloseTo();
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit milestone"
        description="Update the target date or completion."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <MilestoneEditForm recordId={recordId} presetProjectId={presetProjectId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function MilestoneEditForm({
  recordId,
  presetProjectId,
}: MilestoneSurfaceProps & { recordId?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish, query },
    ...form
  } = useForm<MilestoneRecord, HttpError, MilestoneFormValues>({
    refineCoreProps: {
      resource: "hub_pj_milestones",
      action: "edit",
      id: recordId,
      redirect: false,
      meta: { appends: ["project"] },
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });

  const record = query?.data?.data;
  const seeded = useRef(false);
  useEffect(() => {
    if (!record || seeded.current) return;
    seeded.current = true;
    form.reset({
      name: record.name ?? "",
      due_date: record.due_date ?? null,
      done: Boolean(record.done),
      project_id: record.project ? String(record.project.id) : null,
    });
  }, [record, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <MilestoneFormFields
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
