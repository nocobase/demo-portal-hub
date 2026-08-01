import { useList } from "@refinedev/core";
import { useMemo } from "react";
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
import { assigneeName } from "../constants";
import type {
  AssetRecord,
  AssigneeRef,
  AssignmentFormValues,
} from "../types";

export function AssignmentFormFields({
  form,
  lockAsset = false,
  showReturned = false,
}: {
  form: UseFormReturn<AssignmentFormValues>;
  lockAsset?: boolean;
  showReturned?: boolean;
}) {
  // Assets to choose from — in-stock devices plus whatever is already selected
  // (so an edit keeps its current asset visible even if now assigned).
  const { result: assets } = useList<AssetRecord>({
    resource: "hub_as_assets",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    sorters: [{ field: "tag", order: "asc" }],
    errorNotification: false,
    queryOptions: { retry: false, enabled: !lockAsset },
  });
  const { result: users } = useList<AssigneeRef>({
    resource: "users",
    pagination: { mode: "server", currentPage: 1, pageSize: 500 },
    sorters: [{ field: "nickname", order: "asc" }],
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const selectedAssetId = form.watch("asset_id");
  const assetOptions = useMemo(
    () =>
      assets.data
        .filter(
          (asset) =>
            asset.status === "in_stock" ||
            String(asset.id) === String(selectedAssetId)
        )
        .map((asset) => ({
          value: String(asset.id),
          label: `${asset.tag ?? ""} · ${asset.name ?? ""}`.replace(/^ · /, ""),
        })),
    [assets.data, selectedAssetId]
  );

  return (
    <>
      {!lockAsset ? (
        <FormField
          control={form.control}
          name="asset_id"
          rules={{ required: "Pick an asset to assign" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset</FormLabel>
              <FormControl
                render={
                  <NativeSelect
                    {...field}
                    value={field.value == null ? "" : String(field.value)}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                  >
                    <NativeSelectOption value="">
                      Select an in-stock asset
                    </NativeSelectOption>
                    {assetOptions.map((option) => (
                      <NativeSelectOption key={option.value} value={option.value}>
                        {option.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <FormField
        control={form.control}
        name="assignee_id"
        rules={{ required: "Pick who receives this device" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assignee</FormLabel>
            <FormControl
              render={
                <NativeSelect
                  {...field}
                  value={field.value == null ? "" : String(field.value)}
                  onChange={(event) =>
                    field.onChange(event.target.value || null)
                  }
                >
                  <NativeSelectOption value="">Select a person</NativeSelectOption>
                  {users.data.map((user) => (
                    <NativeSelectOption key={String(user.id)} value={String(user.id)}>
                      {assigneeName(user)}
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
          name="assigned_date"
          rules={{ required: "Assigned date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned date</FormLabel>
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

        {showReturned ? (
          <FormField
            control={form.control}
            name="returned_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Returned date</FormLabel>
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
        ) : null}
      </div>

      <FormField
        control={form.control}
        name="note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note</FormLabel>
            <FormControl
              render={
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Anything worth recording about this assignment"
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
