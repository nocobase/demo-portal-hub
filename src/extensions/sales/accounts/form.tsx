import { type HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  RouteDrawer,
  RouteDrawerFooter,
  useRefineUnsavedChangesGuard,
  useRouteSurfaceClose,
} from "@/extensions/nocobase-route-surfaces";
import { getAccountShowPath, salesRoutes } from "../routes";
import type { AccountFormValues, AccountRecord } from "../types";
import { AccountFormFields } from "./fields";

const toServerValues = (values: AccountFormValues) => {
  const { owner_id, ...rest } = values;
  return {
    ...rest,
    owner: owner_id ? Number(owner_id) : null,
  } as unknown as AccountFormValues;
};

export const AccountCreate = () => {
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="New account"
        description="Add a client company to your book of business."
        closeTo={salesRoutes.accounts}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <AccountCreateForm />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function AccountCreateForm() {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish },
    ...form
  } = useForm<AccountRecord, HttpError, AccountFormValues>({
    refineCoreProps: {
      resource: "hub_sales_accounts",
      action: "create",
      redirect: false,
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
    defaultValues: {
      name: "",
      industry: null,
      website: "",
      owner_id: null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <AccountFormFields form={form} />
        </div>
        <RouteDrawerFooter className="flex-row justify-end">
          <Button type="button" variant="outline" onClick={() => close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add account"}
          </Button>
        </RouteDrawerFooter>
      </form>
    </Form>
  );
};

export const AccountEdit = ({
  returnTo = "list",
}: {
  returnTo?: "list" | "show";
}) => {
  const { id } = useParams<{ id: string }>();
  const closeTo =
    returnTo === "show" && id ? getAccountShowPath(id) : salesRoutes.accounts;
  const { beforeClose, confirmation } = useRefineUnsavedChangesGuard();
  return (
    <>
      <RouteDrawer
        title="Edit account"
        description="Update this account's profile."
        closeTo={closeTo}
        closeLabel="Close"
        beforeClose={beforeClose}
      >
        <AccountEditForm id={id} />
      </RouteDrawer>
      {confirmation}
    </>
  );
};

function AccountEditForm({ id }: { id?: string }) {
  const close = useRouteSurfaceClose();
  const {
    refineCore: { onFinish, query },
    ...form
  } = useForm<AccountRecord, HttpError, AccountFormValues>({
    refineCoreProps: {
      resource: "hub_sales_accounts",
      action: "edit",
      id,
      redirect: false,
      meta: { appends: ["owner"] },
      onMutationSuccess: () => close({ skipBeforeClose: true }),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onFinish(toServerValues(values)))}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <AccountFormFields form={form} record={query?.data?.data} />
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
