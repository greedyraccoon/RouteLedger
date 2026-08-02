import type { DriverStatus } from "./types";

/** Shared badge styling so every module renders driver status identically. */
export const DRIVER_STATUS_STYLES: Record<DriverStatus, string> = {
  AVAILABLE: "bg-success/10 text-success border-success/20",
  ON_TRIP: "bg-primary/10 text-primary border-primary/20",
  OFF_DUTY: "bg-muted text-muted-foreground border-border",
  SUSPENDED: "bg-destructive/10 text-destructive border-destructive/20",
};

/** Days until the licence expires; negative when already expired. */
export function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}
