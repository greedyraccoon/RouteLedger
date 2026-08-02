import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { driversQuery, tripsQuery } from "@/lib/data";
import { DRIVER_STATUS_STYLES } from "@/lib/driver-status";
import { formatCurrency, formatDateTime, humanizeEnum } from "@/lib/format";
import { MOCK_DRIVERS, MOCK_TRIPS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dispatch")({
  head: () => ({
    meta: [
      { title: "Dispatch Board — RouteLedger" },
      {
        name: "description",
        content:
          "Live dispatch board pairing RouteLedger drivers with assigned vehicles, active trips, and operational status.",
      },
      { property: "og:title", content: "Dispatch Board — RouteLedger" },
      {
        property: "og:description",
        content: "Drivers, assigned vehicles, active trips, and live operational status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DispatchPage,
});

function DispatchPage() {
  const { data: drivers = MOCK_DRIVERS } = useQuery({
    ...driversQuery(),
    initialData: MOCK_DRIVERS,
  });
  const { data: trips = MOCK_TRIPS } = useQuery({ ...tripsQuery(), initialData: MOCK_TRIPS });

  const activeTripByDriver = useMemo(() => {
    const map = new Map<string, (typeof trips)[number]>();
    for (const t of trips) {
      if (["SCHEDULED", "DISPATCHED", "IN_TRANSIT", "DELAYED"].includes(t.status)) {
        if (!map.has(t.driverId)) map.set(t.driverId, t);
      }
    }
    return map;
  }, [trips]);

  return (
    <AppShell>
      <PageHeader
        title="Dispatch Board"
        description="Who is driving what, right now — assignments, vehicles, and live status."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Driver</th>
              <th className="px-6 py-3 font-medium">Assigned Vehicle</th>
              <th className="px-6 py-3 font-medium">Active Trip</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Current Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {drivers.map((d) => {
              const trip = activeTripByDriver.get(d.id);
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
                    <p className="text-xs text-muted-foreground">{d.id}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground tabular-nums">
                    {trip?.vehicleNumber ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    {trip ? (
                      <>
                        <p className="font-medium">
                          {trip.originName} → {trip.destName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trip.tripCode} · ETA {formatDateTime(trip.scheduledEta)}
                        </p>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No active trip</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        DRIVER_STATUS_STYLES[d.status],
                      )}
                    >
                      {humanizeEnum(d.status)}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-6 py-4 text-right font-medium tabular-nums",
                      d.currentBalance < 0 && "text-destructive",
                    )}
                  >
                    {formatCurrency(d.currentBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Onboarding and status changes live in the{" "}
        <Link to="/drivers" className="text-primary hover:underline">
          Drivers
        </Link>{" "}
        module.
      </p>
    </AppShell>
  );
}
