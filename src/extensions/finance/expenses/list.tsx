import { useList, useUpdate } from "@refinedev/core";
import { Check, Clock, Pencil, Trash2, Wallet, X } from "lucide-react";
import { useMemo } from "react";
import { Outlet } from "react-router";

import { CanAccess } from "@/components/access-control/can-access";
import { AccessDenied } from "@/components/access-control/access-denied";
import { DeleteButton } from "@/components/resources/buttons/delete";
import { EditButton } from "@/components/resources/buttons/edit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES, lookup } from "../constants";
import { fmtDate, money, PageHeader, Pill, StatCard } from "../shared";
import type { Expense } from "../types";

const RESOURCE = "hub_fin_expenses";

export function ExpenseListPage() {
  return (
    <>
      <CanAccess resource={RESOURCE} action="list" fallback={<AccessDenied />}>
        <ExpenseList />
      </CanAccess>
      <Outlet />
    </>
  );
}

function employeeName(exp: Expense): string {
  return (
    exp.employee?.nickname ||
    exp.employee?.username ||
    exp.employee?.email ||
    "—"
  );
}

function ExpenseList() {
  const { result, query } = useList<Expense>({
    resource: RESOURCE,
    pagination: { mode: "off" },
    sorters: [{ field: "spent_at", order: "desc" }],
    meta: { appends: ["employee"] },
  });
  const rows = result?.data ?? [];

  const { mutate, mutation } = useUpdate();
  const isPending = mutation.isPending;
  const setStatus = (id: number, status: string) =>
    mutate({
      resource: RESOURCE,
      id,
      values: { status },
      successNotification: {
        type: "success",
        message: `Expense ${status}`,
      },
    });

  const stats = useMemo(() => {
    let pendingCount = 0;
    let pendingAmount = 0;
    let approvedAmount = 0;
    let total = 0;
    for (const exp of rows) {
      const amt = Number(exp.amount) || 0;
      if (exp.status !== "rejected") total += amt;
      if (exp.status === "pending") {
        pendingCount += 1;
        pendingAmount += amt;
      }
      if (exp.status === "approved" || exp.status === "reimbursed") {
        approvedAmount += amt;
      }
    }
    return { pendingCount, pendingAmount, approvedAmount, total };
  }, [rows]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expenses"
        description="Employee expense claims — review, approve and reimburse."
        createResource={RESOURCE}
        createLabel="New expense"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting approval"
          value={String(stats.pendingCount)}
          hint={`${money(stats.pendingAmount)} pending`}
          icon={<Clock className="size-4" />}
          tone="bg-amber-500/12 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Pending amount"
          value={money(stats.pendingAmount)}
          hint="Needs a decision"
          icon={<Wallet className="size-4" />}
          tone="bg-blue-500/12 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Approved & reimbursed"
          value={money(stats.approvedAmount)}
          hint="Cleared claims"
          icon={<Check className="size-4" />}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Total claimed"
          value={money(stats.total)}
          hint="Excludes rejected"
          icon={<Wallet className="size-4" />}
          tone="bg-violet-500/12 text-violet-600 dark:text-violet-400"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All expense claims</CardTitle>
          <CardDescription>
            Approve or reject pending claims inline. Newest spend first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Loading expenses…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No expenses yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((exp) => {
                    const pending = exp.status === "pending";
                    return (
                      <TableRow key={exp.id}>
                        <TableCell className="font-medium">{exp.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {employeeName(exp)}
                        </TableCell>
                        <TableCell>
                          <Pill option={lookup(EXPENSE_CATEGORIES, exp.category)} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {money(exp.amount, true)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {fmtDate(exp.spent_at)}
                        </TableCell>
                        <TableCell>
                          <Pill option={lookup(EXPENSE_STATUSES, exp.status)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {pending ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isPending}
                                  className="text-emerald-600 hover:bg-emerald-500/12 hover:text-emerald-700 dark:text-emerald-400"
                                  onClick={() => setStatus(exp.id, "approved")}
                                >
                                  <Check />
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isPending}
                                  className="text-red-600 hover:bg-red-500/12 hover:text-red-700 dark:text-red-400"
                                  onClick={() => setStatus(exp.id, "rejected")}
                                >
                                  <X />
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <>
                                <EditButton
                                  resource={RESOURCE}
                                  recordItemId={exp.id}
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Edit expense"
                                  title="Edit expense"
                                >
                                  <Pencil />
                                </EditButton>
                                <DeleteButton
                                  resource={RESOURCE}
                                  recordItemId={exp.id}
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  aria-label="Delete expense"
                                  title="Delete expense"
                                >
                                  <Trash2 />
                                </DeleteButton>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
