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
import { createTrip, driversQuery, tripsQuery } from "@/lib/data";
import { formatDateTime, humanizeEnum, toIso } from "@/lib/format";
import { MOCK_DRIVERS, MOCK_TRIPS } from "@/lib/mock-data";
import type { CreateTripRequest, TripResponse, TripStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "Trips — RouteLedger" },
      {
        name: "description",
        content:
          "Plan and track RouteLedger trips: trip codes, drivers, lanes, cargo, live status, and scheduled ETAs.",
      },
      { property: "og:title", content: "Trips — RouteLedger" },
      {
        property: "og:description",
        content: "Trip codes, drivers, lanes, cargo, live status, and scheduled ETAs in one table.",
      },
    ],
  }),
  component: TripsPage,
});

const STATUS_STYLES: Record<TripStatus, string> = {
  SCHEDULED: "bg-muted text-muted-foreground border-border",
  DISPATCHED: "bg-primary/10 text-primary border-primary/20",
  IN_TRANSIT: "bg-primary/10 text-primary border-primary/20",
  DELAYED: "bg-warning/10 text-warning border-warning/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

/** Mirrors the backend's CreateTripRequest validation rules. */
function validateTrip(body: CreateTripRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!body.tripCode.trim()) errors.tripCode = "Trip code is required.";
  if (!body.driverId) errors.driverId = "Select a driver.";
  if (!body.vehicleNumber.trim()) errors.vehicleNumber = "Vehicle number is required.";
  if (!body.originName.trim()) errors.originName = "Origin is required.";
  if (!body.destName.trim()) errors.destName = "Destination is required.";
  if (!body.cargoType.trim()) errors.cargoType = "Cargo type is required.";
  if (!(body.cargoWeightTons > 0)) errors.cargoWeightTons = "Cargo weight must be greater than 0.";
  if (!body.scheduledDeparture) errors.scheduledDeparture = "Scheduled departure is required.";
  if (!body.scheduledEta) errors.scheduledEta = "Scheduled ETA is required.";
  else if (
    body.scheduledDeparture &&
    new Date(body.scheduledEta) <= new Date(body.scheduledDeparture)
  )
    errors.scheduledEta = "ETA must be after the scheduled departure.";
  if (!(body.totalDistanceKm > 0)) errors.totalDistanceKm = "Distance must be greater than 0.";
  return errors;
}

function TripsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: trips = MOCK_TRIPS } = useQuery({ ...tripsQuery(), initialData: MOCK_TRIPS });
  const { data: drivers = MOCK_DRIVERS } = useQuery({
    ...driversQuery(),
    initialData: MOCK_DRIVERS,
  });

  const addTrip = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const departureRaw = String(form.get("scheduledDeparture") ?? "");
    const etaRaw = String(form.get("scheduledEta") ?? "");

    const body: CreateTripRequest = {
      tripCode: String(form.get("tripCode") ?? "").trim(),
      driverId: String(form.get("driverId") ?? ""),
      vehicleNumber: String(form.get("vehicleNumber") ?? "").trim(),
      originName: String(form.get("originName") ?? "").trim(),
      destName: String(form.get("destName") ?? "").trim(),
      cargoType: String(form.get("cargoType") ?? "").trim(),
      cargoWeightTons: Number(form.get("cargoWeightTons") ?? 0),
      scheduledDeparture: departureRaw ? toIso(departureRaw) : "",
      scheduledEta: etaRaw ? toIso(etaRaw) : "",
      totalDistanceKm: Number(form.get("totalDistanceKm") ?? 0),
    };

    const found = validateTrip(body);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const optimistic: TripResponse = {
      id: `TRP-${trips.length + 1}`,
      ...body,
      driverName: drivers.find((d) => d.id === body.driverId)?.fullName ?? "Unassigned",
      status: "SCHEDULED",
      actualDeparture: null,
    };

    // Optimistic: the row appears immediately whether or not the API is live.
    queryClient.setQueryData<TripResponse[]>(tripsQuery().queryKey, (prev) => [
      optimistic,
      ...(prev ?? []),
    ]);
    void createTrip(body);

    setOpen(false);
    toast.success("Trip created", {
      description: `${body.tripCode} · ${body.originName} → ${body.destName}`,
    });
  };

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between gap-4">
        <PageHeader
          title="Trips"
          description="Scheduled and active journeys across the RouteLedger network."
        />
        <Button
          onClick={() => {
            setErrors({});
            setOpen(true);
          }}
          className="mb-8"
        >
          <Plus className="size-4" />
          Add Trip
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Trip Code</th>
              <th className="px-6 py-3 font-medium">Driver</th>
              <th className="px-6 py-3 font-medium">Route</th>
              <th className="px-6 py-3 font-medium">Cargo</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Scheduled ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trips.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-muted/50">
                <td className="px-6 py-4">
                  <p className="font-medium">{t.tripCode}</p>
                  <p className="text-xs text-muted-foreground">{t.vehicleNumber}</p>
                </td>
                <td className="px-6 py-4">
                  <p>{t.driverName}</p>
                  <p className="text-xs text-muted-foreground">{t.driverId}</p>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {t.originName} → {t.destName}
                  <span className="block text-xs">{t.totalDistanceKm} km</span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {t.cargoType}
                  <span className="block text-xs">{t.cargoWeightTons} t</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      STATUS_STYLES[t.status] ?? STATUS_STYLES.SCHEDULED,
                    )}
                  >
                    {humanizeEnum(t.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{formatDateTime(t.scheduledEta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New trip</DialogTitle>
            <DialogDescription>
              Fields map one-to-one to the backend CreateTripRequest.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addTrip} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tripCode">Trip Code</Label>
                <Input id="tripCode" name="tripCode" placeholder="TRP-8806" />
                <FieldError message={errors.tripCode} />
              </div>
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
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input id="vehicleNumber" name="vehicleNumber" placeholder="RL-4421" />
                <FieldError message={errors.vehicleNumber} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargoType">Cargo Type</Label>
                <Input id="cargoType" name="cargoType" placeholder="Electronics" />
                <FieldError message={errors.cargoType} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originName">Origin</Label>
                <Input id="originName" name="originName" placeholder="Rotterdam" />
                <FieldError message={errors.originName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destName">Destination</Label>
                <Input id="destName" name="destName" placeholder="Hamburg" />
                <FieldError message={errors.destName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargoWeightTons">Cargo Weight (tons)</Label>
                <Input
                  id="cargoWeightTons"
                  name="cargoWeightTons"
                  type="number"
                  step="0.01"
                  min="0"
                />
                <FieldError message={errors.cargoWeightTons} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalDistanceKm">Total Distance (km)</Label>
                <Input id="totalDistanceKm" name="totalDistanceKm" type="number" min="0" />
                <FieldError message={errors.totalDistanceKm} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDeparture">Scheduled Departure</Label>
                <Input id="scheduledDeparture" name="scheduledDeparture" type="datetime-local" />
                <FieldError message={errors.scheduledDeparture} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledEta">Scheduled ETA</Label>
                <Input id="scheduledEta" name="scheduledEta" type="datetime-local" />
                <FieldError message={errors.scheduledEta} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create trip</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
