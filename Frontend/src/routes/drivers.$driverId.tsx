import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { driverQuery, driversQuery, ledgerQuery, tripsQuery, updateDriverStatus } from "@/lib/data";
import { DRIVER_STATUS_STYLES, daysUntil } from "@/lib/driver-status";
import { formatCurrency, formatDate, formatDateTime, humanizeEnum } from "@/lib/format";
import { MOCK_ALERTS, MOCK_DRIVERS, MOCK_LEDGER, MOCK_TRIPS } from "@/lib/mock-data";
import { DRIVER_STATUSES } from "@/lib/types";
import type { DriverResponse, DriverStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/drivers/$driverId")({
  head: () => ({
    meta: [
      { title: "Driver Profile — RouteLedger" },
      {
        name: "description",
        content:
          "Driver profile with licence details, running ledger balance, assigned trips, and operational status controls.",
      },
      { property: "og:title", content: "Driver Profile — RouteLedger" },
      {
        property: "og:description",
        content: "Licence details, ledger balance, assigned trips, and status controls.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DriverDetailPage,
});

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function DriverDetailPage() {
  const { driverId } = Route.useParams();
  const queryClient = useQueryClient();

  const fallback = MOCK_DRIVERS.find((d) => d.id === driverId) ?? null;
  const { data: driver } = useQuery({ ...driverQuery(driverId), initialData: fallback });
  const { data: trips = MOCK_TRIPS } = useQuery({ ...tripsQuery(), initialData: MOCK_TRIPS });
  const { data: ledger = MOCK_LEDGER } = useQuery({ ...ledgerQuery(), initialData: MOCK_LEDGER });

  if (!driver) {
    return (
      <AppShell>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <h1 className="text-lg font-semibold">Driver not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No driver matches the id <span className="font-mono">{driverId}</span>.
          </p>
          <Link to="/drivers" className="mt-4 inline-block text-sm text-primary hover:underline">
            Back to drivers
          </Link>
        </div>
      </AppShell>
    );
  }

  const driverTrips = trips.filter((t) => t.driverId === driver.id);
  const driverLedger = ledger.filter((l) => l.driverId === driver.id);
  const driverAlerts = MOCK_ALERTS.filter((a) =>
    driverTrips.some((t) => t.id === a.tripId || t.tripCode === a.tripCode),
  );
  const days = daysUntil(driver.licenseExpiryDate);

  const changeStatus = (status: DriverStatus) => {
    const patch = (d: DriverResponse) => ({ ...d, status, updatedAt: new Date().toISOString() });
    queryClient.setQueryData<DriverResponse | null>(driverQuery(driver.id).queryKey, (prev) =>
      prev ? patch(prev) : prev,
    );
    queryClient.setQueryData<DriverResponse[]>(driversQuery().queryKey, (prev) =>
      (prev ?? []).map((d) => (d.id === driver.id ? patch(d) : d)),
    );
    void updateDriverStatus(driver.id, { status });
    toast.success("Status updated", { description: humanizeEnum(status) });
  };

  return (
    <AppShell>
      <Link
        to="/drivers"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Drivers
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {initials(driver.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold tracking-tight">{driver.fullName}</h1>
              <p className="text-sm text-muted-foreground">
                {driver.id} · {driver.phoneNumber}
              </p>
            </div>
            <select
              value={driver.status}
              onChange={(e) => changeStatus(e.target.value as DriverStatus)}
              aria-label="Driver status"
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium outline-none",
                DRIVER_STATUS_STYLES[driver.status],
              )}
            >
              {DRIVER_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-card text-foreground">
                  {humanizeEnum(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="License Number" value={driver.licenseNumber} />
            <Field
              label="License Expiry"
              value={
                <span className={cn(days <= 30 && "text-destructive")}>
                  {formatDate(driver.licenseExpiryDate)}
                  {days < 0 ? " · expired" : days <= 30 ? ` · ${days}d left` : ""}
                </span>
              }
            />
            <Field label="Created" value={formatDateTime(driver.createdAt)} />
            <Field label="Last Updated" value={formatDateTime(driver.updatedAt)} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Balance</p>
            <p
              className={cn(
                "mt-2 text-3xl font-semibold tabular-nums",
                driver.currentBalance < 0 && "text-destructive",
              )}
            >
              {formatCurrency(driver.currentBalance)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {driver.currentBalance < 0
                ? "Driver owes the company."
                : "Company owes the driver."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
              <p className="text-2xl font-semibold tabular-nums">{driverTrips.length}</p>
              <p className="text-xs text-muted-foreground">Trips</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
              <p className="text-2xl font-semibold tabular-nums">{driverAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Alerts</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Assigned trips
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Trip</th>
                <th className="px-6 py-3 font-medium">Route</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Scheduled ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {driverTrips.map((t) => (
                <tr key={t.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{t.tripCode}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {t.originName} → {t.destName}
                  </td>
                  <td className="px-6 py-4">{humanizeEnum(t.status)}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDateTime(t.scheduledEta)}
                  </td>
                </tr>
              ))}
              {driverTrips.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    No trips assigned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ledger entries
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Entry Type</th>
                <th className="px-6 py-3 font-medium">Notes</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {driverLedger.map((l) => (
                <tr key={l.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{humanizeEnum(l.entryType)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{l.notes ?? "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDateTime(l.createdAt)}</td>
                  <td
                    className={cn(
                      "px-6 py-4 text-right font-medium tabular-nums",
                      l.transactionType === "CREDIT" ? "text-success" : "text-destructive",
                    )}
                  >
                    {l.transactionType === "CREDIT" ? "+" : "−"}
                    {formatCurrency(l.amount)}
                  </td>
                </tr>
              ))}
              {driverLedger.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    No ledger entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
