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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { acknowledgeAlert, alertsQuery, createAlert, tripsQuery } from "@/lib/data";
import { formatDateTime, humanizeEnum } from "@/lib/format";
import { MOCK_ALERTS, MOCK_TRIPS } from "@/lib/mock-data";
import {
  ALERT_SEVERITIES,
  ALERT_TYPES,
  type AlertResponse,
  type AlertSeverity,
  type CreateAlertRequest,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — RouteLedger" },
      {
        name: "description",
        content:
          "Monitor and acknowledge RouteLedger system alerts across SLA breaches, route deviations, delays, and licence expiry.",
      },
      { property: "og:title", content: "Alerts — RouteLedger" },
      {
        property: "og:description",
        content: "Monitor and acknowledge SLA, routing, delay, and licence-expiry alerts.",
      },
    ],
  }),
  component: AlertsPage,
});

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  INFO: "bg-success/10 text-success border-success/20",
  WARNING: "bg-warning/10 text-warning border-warning/20",
  CRITICAL: "bg-destructive/10 text-destructive border-destructive/20",
};

function validateAlert(body: CreateAlertRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!body.tripId) errors.tripId = "Select a trip.";
  if (!body.alertType) errors.alertType = "Alert type is required.";
  if (!body.alertSeverity) errors.alertSeverity = "Severity is required.";
  if (!body.message.trim()) errors.message = "Message is required.";
  return errors;
}

function AlertsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: alerts = MOCK_ALERTS } = useQuery({ ...alertsQuery(), initialData: MOCK_ALERTS });
  const { data: trips = MOCK_TRIPS } = useQuery({ ...tripsQuery(), initialData: MOCK_TRIPS });
  const [pending, setPending] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const acknowledge = (id: string) => {
    const acknowledgedBy = user?.email ?? "unknown@routeledger.io";
    setPending(id);
    queryClient.setQueryData<AlertResponse[]>(alertsQuery().queryKey, (prev) =>
      (prev ?? []).map((a) => (a.id === id ? { ...a, isAcknowledged: true, acknowledgedBy } : a)),
    );
    void acknowledgeAlert(id, { acknowledgedBy }).finally(() => setPending(null));
    toast.success("Alert acknowledged", { description: id });
  };

  const addAlert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const body: CreateAlertRequest = {
      tripId: String(form.get("tripId") ?? ""),
      alertType: form.get("alertType") as CreateAlertRequest["alertType"],
      alertSeverity: form.get("alertSeverity") as CreateAlertRequest["alertSeverity"],
      message: String(form.get("message") ?? "").trim(),
    };

    const found = validateAlert(body);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const optimistic: AlertResponse = {
      id: `ALR-${206 + alerts.length}`,
      ...body,
      tripCode: trips.find((t) => t.id === body.tripId)?.tripCode ?? body.tripId,
      isAcknowledged: false,
      acknowledgedBy: null,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData<AlertResponse[]>(alertsQuery().queryKey, (prev) => [
      optimistic,
      ...(prev ?? []),
    ]);
    void createAlert(body);

    setOpen(false);
    toast.success("Alert raised", { description: humanizeEnum(body.alertType) });
  };

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between gap-4">
        <PageHeader
          title="Alerts"
          description="System-generated notices requiring operator review and acknowledgement."
        />
        <Button
          onClick={() => {
            setErrors({});
            setOpen(true);
          }}
          className="mb-8"
        >
          <Plus className="size-4" />
          Add Alert
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Trip</th>
              <th className="px-6 py-3 font-medium">Severity</th>
              <th className="px-6 py-3 font-medium">Message</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {alerts.map((a) => (
              <tr key={a.id} className="transition-colors hover:bg-muted/50">
                <td className="px-6 py-4">
                  <p className="font-medium">{humanizeEnum(a.alertType)}</p>
                  <p className="text-xs text-muted-foreground">{a.id}</p>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{a.tripCode}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      SEVERITY_STYLES[a.alertSeverity] ?? SEVERITY_STYLES.INFO,
                    )}
                  >
                    {a.alertSeverity}
                  </span>
                </td>
                <td className="max-w-md px-6 py-4 text-muted-foreground">
                  {a.message}
                  <span className="block text-xs">{formatDateTime(a.createdAt)}</span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {a.isAcknowledged ? `Acknowledged by ${a.acknowledgedBy ?? "—"}` : "Unacknowledged"}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={a.isAcknowledged || pending === a.id}
                    onClick={() => acknowledge(a.id)}
                  >
                    Acknowledge
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New alert</DialogTitle>
            <DialogDescription>
              Fields map one-to-one to the backend CreateAlertRequest.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addAlert} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tripId">Trip</Label>
              <select
                id="tripId"
                name="tripId"
                defaultValue=""
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              >
                <option value="">Select a trip</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tripCode} · {t.originName} → {t.destName}
                  </option>
                ))}
              </select>
              <FieldError message={errors.tripId} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alertType">Alert Type</Label>
                <select
                  id="alertType"
                  name="alertType"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  {ALERT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.alertType} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertSeverity">Severity</Label>
                <select
                  id="alertSeverity"
                  name="alertSeverity"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                >
                  {ALERT_SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.alertSeverity} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={3} placeholder="What happened?" />
              <FieldError message={errors.message} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Raise alert</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
