import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Truck, Route as RouteIcon, AlertTriangle, Gauge } from "lucide-react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { alertsQuery, driversQuery, tripsQuery } from "@/lib/data";
import { formatCurrency, humanizeEnum } from "@/lib/format";
import { MOCK_ALERTS, MOCK_DRIVERS, MOCK_TRIPS } from "@/lib/mock-data";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — RouteLedger Fleet Operations" },
      {
        name: "description",
        content:
          "RouteLedger dashboard: live fleet metrics for active drivers, pending trips, and system alerts.",
      },
      { property: "og:title", content: "Dashboard — RouteLedger Fleet Operations" },
      {
        property: "og:description",
        content: "Live fleet metrics for active drivers, pending trips, and system alerts.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: drivers = MOCK_DRIVERS } = useQuery({
    ...driversQuery(),
    initialData: MOCK_DRIVERS,
  });
  const { data: trips = MOCK_TRIPS } = useQuery({ ...tripsQuery(), initialData: MOCK_TRIPS });
  const { data: alerts = MOCK_ALERTS } = useQuery({ ...alertsQuery(), initialData: MOCK_ALERTS });

  const onDuty = drivers.filter((d) => d.status !== "SUSPENDED").length;
  const pending = trips.filter((t) => t.status === "SCHEDULED" || t.status === "DELAYED").length;
  const open = alerts.filter((a) => !a.isAcknowledged).length;
  const utilization = drivers.length
    ? Math.round((drivers.filter((d) => d.status === "ON_TRIP").length / drivers.length) * 100)
    : 0;


  const metrics = [
    { label: "Active Drivers", value: String(onDuty), delta: `${drivers.length} in roster`, icon: Truck },
    { label: "Pending Trips", value: String(pending), delta: `${trips.length} total scheduled`, icon: RouteIcon },
    { label: "Fleet Utilization", value: `${utilization}%`, delta: "drivers currently en route", icon: Gauge },
    { label: "System Alerts", value: String(open), delta: `${alerts.length} logged this period`, icon: AlertTriangle },
  ];

  return (
    <AppShell>
      <PageHeader title="Dashboard" description="A live overview of fleet health and dispatch load." />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{m.label}</span>
              <m.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{m.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.delta}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold">Recent activity</h2>
        </div>
        <ul className="divide-y divide-border">
          {drivers.slice(0, 4).map((d) => (
            <li key={d.id} className="flex items-center justify-between px-6 py-4 text-sm">
              <div>
                <p className="font-medium">{d.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {d.licenseNumber} · {formatCurrency(d.currentBalance)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{humanizeEnum(d.status)}</span>
            </li>

          ))}
        </ul>
      </section>
    </AppShell>
  );
}
