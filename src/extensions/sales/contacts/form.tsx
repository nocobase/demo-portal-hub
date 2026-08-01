import { type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
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
import type { UseFormReturn } from "react-hook-form";
import { getAccountShowPath } from "../routes";
import type { ContactFormValues, ContactRecord } from "../types";

type ContactSurfaceProps = {
  presetAccountId?: string;
  idParam?: string;
};

const toServerValues = (values: ContactFormValues) => {
  const { account_id, ...rest } = values;
  return {
    ...rest,
    account: account_id ? Number(account_id) : null,
  } as unknown as ContactFormValues;
};

function ContactFormFields({
  form,
}: {
  form: UseFormReturn<ContactFormValues>;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        rules={{ required: "Contact name is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. Diana Prince"
                />
              }
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job title</FormLabel>
            <FormControl
              render={
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="e.g. VP of Procurement"
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
              <FormLabel>Email</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    type="email"
                    placeholder="name@company.com"
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl
                render={
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="+1-202-555-0100"
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

export const ContactCreate = ({ presetAccountId }: ContactSurfaceProps) => {
  const { id } = useParams<{ id: string }>();
  const accountId = presetAccountId ?? id;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New contact"
        description="Add a person you deal with at this account."
        closeTo={accountId ? getAccountShowPath(accountId) : "/accounts"}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <ContactCreateForm accountId={accountId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function ContactCreateForm({ accountId }: { accountId?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<ContactRecord, HttpError, ContactFormValues>({
    refineCoreProps: {
      resource: "hub_sales_contacts",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      name: "",
      title: "",
      email: "",
      phone: "",
      account_id: accountId ? String(accountId) : null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <ContactFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add contact"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
}

export const ContactEdit = ({
  presetAccountId,
  idParam = "contactId",
}: ContactSurfaceProps) => {
  const params = useParams<Record<string, string>>();
  const recordId = params[idParam];
  const accountId = presetAccountId ?? params.id;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit contact"
        description="Update this contact's details."
        closeTo={accountId ? getAccountShowPath(accountId) : "/accounts"}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <ContactEditForm recordId={recordId} accountId={accountId} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function ContactEditForm({
  recordId,
  accountId,
}: {
  recordId?: string;
  accountId?: string;
}) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<ContactRecord, HttpError, ContactFormValues>({
    refineCoreProps: {
      resource: "hub_sales_contacts",
      action: "edit",
      id: recordId,
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });
  void accountId;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <ContactFormFields form={form} />
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
