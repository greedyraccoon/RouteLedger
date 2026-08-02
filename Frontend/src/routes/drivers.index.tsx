import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
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
import { createDriver, driversQuery, updateDriverStatus } from "@/lib/data";
import { DRIVER_STATUS_STYLES, daysUntil } from "@/lib/driver-status";
import { formatCurrency, formatDate, humanizeEnum } from "@/lib/format";
import { MOCK_DRIVERS } from "@/lib/mock-data";
import { DRIVER_STATUSES } from "@/lib/types";
import type { CreateDriverRequest, DriverResponse, DriverStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/drivers/")({
  head: () => ({
    meta: [
      { title: "Drivers — RouteLedger" },
      {
        name: "description",
        content:
          "Manage the RouteLedger driver roster: onboard drivers, track licence validity, update operational status, and review running balances.",
      },
      { property: "og:title", content: "Drivers — RouteLedger" },
      {
        property: "og:description",
        content: "Onboard drivers, track licences, update status, and review running balances.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DriversPage,
});

/** Mirrors the backend's CreateDriverRequest bean validation. */
function validateDriver(body: CreateDriverRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!body.fullName.trim()) errors.fullName = "Full name is required.";
  if (!body.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
  else if (!/^\d{10}$/.test(body.phoneNumber))
    errors.phoneNumber = "Phone number must be a valid 10-digit number.";
  if (!body.licenseNumber.trim()) errors.licenseNumber = "License number is required.";
  if (!body.licenseExpiryDate) errors.licenseExpiryDate = "License expiry date is required.";
  else if (new Date(body.licenseExpiryDate).getTime() <= Date.now())
    errors.licenseExpiryDate = "License must not be expired.";
  return errors;
}

const FILTERS: Array<{ value: DriverStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  ...DRIVER_STATUSES.map((s) => ({ value: s, label: humanizeEnum(s) })),
];

function DriversPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<DriverStatus | "ALL">("ALL");

  const { data: drivers = MOCK_DRIVERS } = useQuery({
    ...driversQuery(),
    initialData: MOCK_DRIVERS,
  });

  const visible = filter === "ALL" ? drivers : drivers.filter((d) => d.status === filter);

  const changeStatus = (driver: DriverResponse, status: DriverStatus) => {
    queryClient.setQueryData<DriverResponse[]>(driversQuery().queryKey, (prev) =>
      (prev ?? []).map((d) =>
        d.id === driver.id ? { ...d, status, updatedAt: new Date().toISOString() } : d,
      ),
    );
    void updateDriverStatus(driver.id, { status });
    toast.success("Status updated", {
      description: `${driver.fullName} → ${humanizeEnum(status)}`,
    });
  };

  const addDriver = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const body: CreateDriverRequest = {
      fullName: String(form.get("fullName") ?? "").trim(),
      phoneNumber: String(form.get("phoneNumber") ?? "").trim(),
      licenseNumber: String(form.get("licenseNumber") ?? "").trim(),
      licenseExpiryDate: String(form.get("licenseExpiryDate") ?? ""),
    };

    const found = validateDriver(body);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const now = new Date().toISOString();
    const optimistic: DriverResponse = {
      id: `DRV-${1300 + drivers.length}`,
      ...body,
      status: "AVAILABLE",
      currentBalance: 0,
      createdAt: now,
      updatedAt: now,
    };

    queryClient.setQueryData<DriverResponse[]>(driversQuery().queryKey, (prev) => [
      optimistic,
      ...(prev ?? []),
    ]);
    void createDriver(body).then((created) => {
      if (!created?.id) return;
      queryClient.setQueryData<DriverResponse[]>(driversQuery().queryKey, (prev) =>
        (prev ?? []).map((d) => (d.id === optimistic.id ? created : d)),
      );
    });

    setOpen(false);
    toast.success("Driver created", { description: body.fullName });
  };

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between gap-4">
        <PageHeader
          title="Drivers"
          description={`${drivers.length} drivers on the roster — licences, balances, and operational status.`}
        />
        <Button
          onClick={() => {
            setErrors({});
            setOpen(true);
          }}
          className="mb-8"
        >
          <Plus className="size-4" />
          New Driver
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Driver</th>
              <th className="px-6 py-3 font-medium">License</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Current Balance</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((d) => {
              const days = daysUntil(d.licenseExpiryDate);
              return (
                <tr key={d.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <Link
                      to="/drivers/$driverId"
                      params={{ driverId: d.id }}
                      className="font-medium hover:underline"
                    >
                      {d.fullName}
                    </Link>
                    <p className="text-xs text-muted-foreground tabular-nums">{d.phoneNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p>{d.licenseNumber}</p>
                    <p
                      className={cn(
                        "text-xs text-muted-foreground",
                        days <= 30 && "font-medium text-destructive",
                      )}
                    >
                      {days < 0 ? "Expired " : "Expires "}
                      {formatDate(d.licenseExpiryDate)}
                      {days >= 0 && days <= 30 ? ` · ${days}d left` : ""}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={d.status}
                      onChange={(e) => changeStatus(d, e.target.value as DriverStatus)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-medium outline-none",
                        DRIVER_STATUS_STYLES[d.status],
                      )}
                      aria-label={`Status for ${d.fullName}`}
                    >
                      {DRIVER_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-card text-foreground">
                          {humanizeEnum(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td
                    className={cn(
                      "px-6 py-4 text-right font-medium tabular-nums",
                      d.currentBalance < 0 && "text-destructive",
                    )}
                  >
                    {formatCurrency(d.currentBalance)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to="/drivers/$driverId"
                      params={{ driverId: d.id }}
                      className="inline-flex items-center text-muted-foreground hover:text-foreground"
                      aria-label={`Open ${d.fullName}`}
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No drivers with this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New driver</DialogTitle>
            <DialogDescription>
              Fields map one-to-one to the backend CreateDriverRequest.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addDriver} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" placeholder="Marcus Delgado" />
              <FieldError message={errors.fullName} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9820114421"
                />
                <FieldError message={errors.phoneNumber} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input id="licenseNumber" name="licenseNumber" placeholder="NL-DL-4421889" />
                <FieldError message={errors.licenseNumber} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseExpiryDate">License Expiry Date</Label>
              <Input id="licenseExpiryDate" name="licenseExpiryDate" type="date" />
              <FieldError message={errors.licenseExpiryDate} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create driver</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
