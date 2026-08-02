import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/app-shell";
import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLedgerEntry, driversQuery, ledgerQuery, tripsQuery } from "@/lib/data";
import { formatCurrency, formatDateTime, humanizeEnum } from "@/lib/format";
import { MOCK_DRIVERS, MOCK_LEDGER, MOCK_TRIPS } from "@/lib/mock-data";
import {
  LEDGER_ENTRY_TYPES,
  TRANSACTION_TYPES,
  type CreateLedgerEntryRequest,
  type LedgerEntryResponse,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "Ledger — RouteLedger" },
      {
        name: "description",
        content:
          "Financial ledger for RouteLedger: trip advances, fuel allowances, tolls, penalties, and settlements.",
      },
      { property: "og:title", content: "Ledger — RouteLedger" },
      {
        property: "og:description",
        content: "Trip advances, fuel allowances, tolls, penalties, and settlements per driver.",
      },
    ],
  }),
  component: LedgerPage,
});

/** Mirrors the backend's CreateLedgerEntryRequest validation rules. */
function validateEntry(body: CreateLedgerEntryRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!body.driverId) errors.driverId = "Select a driver.";
  if (!body.entryType) errors.entryType = "Entry type is required.";
  if (!body.transactionType) errors.transactionType = "Transaction type is required.";
  if (!(body.amount >= 0.01)) errors.amount = "Amount must be at least 0.01.";
  return errors;
}

function LedgerPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: rows = MOCK_LEDGER } = useQuery({ ...ledgerQuery(), initialData: MOCK_LEDGER });
  const { data: drivers = MOCK_DRIVERS } = useQuery({
    ...driversQuery(),
    initialData: MOCK_DRIVERS,
  });
  const { data: trips = MOCK_TRIPS } = useQuery({ ...tripsQuery(), initialData: MOCK_TRIPS });

  const driverName = (id: string) => drivers.find((d) => d.id === id)?.fullName ?? id;
  const tripCode = (id: string | null) =>
    id ? (trips.find((t) => t.id === id)?.tripCode ?? id) : "—";

  const addEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const notes = String(form.get("notes") ?? "").trim();
    const tripId = String(form.get("tripId") ?? "");

    const body: CreateLedgerEntryRequest = {
      driverId: String(form.get("driverId") ?? ""),
      tripId: tripId || null,
      entryType: form.get("entryType") as CreateLedgerEntryRequest["entryType"],
      transactionType: form.get("transactionType") as CreateLedgerEntryRequest["transactionType"],
      amount: Number(form.get("amount") ?? 0),
      notes: notes || null,
    };

    const found = validateEntry(body);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const optimistic: LedgerEntryResponse = {
      id: `LG-${4007 + rows.length}`,
      ...body,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData<LedgerEntryResponse[]>(ledgerQuery().queryKey, (prev) => [
      optimistic,
      ...(prev ?? []),
    ]);
    void createLedgerEntry(body);

    setOpen(false);
    toast.success("Ledger entry added", {
      description: `${humanizeEnum(body.entryType)} · ${body.transactionType}`,
    });
  };

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between gap-4">
        <PageHeader
          title="Ledger"
          description="Trip-level financial records across the fleet, by driver and entry type."
        />
        <Button
          onClick={() => {
            setErrors({});
            setOpen(true);
          }}
          className="mb-8"
        >
          <Plus className="size-4" />
          Add Entry
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Driver</th>
              <th className="px-6 py-3 font-medium">Trip</th>
              <th className="px-6 py-3 font-medium">Entry Type</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Transaction</th>
              <th className="px-6 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/50">
                <td className="px-6 py-4">
                  <p className="font-medium">{driverName(r.driverId)}</p>
                  <p className="text-xs text-muted-foreground">{r.id}</p>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{tripCode(r.tripId)}</td>
                <td className="px-6 py-4">
                  <p>{humanizeEnum(r.entryType)}</p>
                  {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                </td>
                <td className="px-6 py-4 font-medium tabular-nums">{formatCurrency(r.amount)}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      r.transactionType === "CREDIT"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-destructive/10 text-destructive border-destructive/20",
                    )}
                  >
                    {r.transactionType}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {formatDateTime(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New ledger entry</DialogTitle>
            <DialogDescription>
              Fields map one-to-one to the backend CreateLedgerEntryRequest.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addEntry} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="driverId">Driver</Label>
                <select
                  id="driverId"
                  name="driverId"
                  defaultValue=""
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  <option value="">Select a driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.driverId} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tripId">Trip (optional)</Label>
                <select
                  id="tripId"
                  name="tripId"
                  defaultValue=""
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  <option value="">No trip</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tripCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryType">Entry Type</Label>
                <select
                  id="entryType"
                  name="entryType"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  {LEDGER_ENTRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.entryType} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionType">Transaction Type</Label>
                <select
                  id="transactionType"
                  name="transactionType"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  {TRANSACTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.transactionType} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01" />
              <FieldError message={errors.amount} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" name="notes" rows={3} placeholder="Context for this entry" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
