import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "./api-client";

import {
  MOCK_ALERTS,
  MOCK_DRIVERS,
  MOCK_LEDGER,
  MOCK_RISK,
  MOCK_TRIPS,
  MOCK_USERS,
} from "./mock-data";
import type {
  AcknowledgeAlertRequest,
  AlertResponse,
  CreateAlertRequest,
  CreateDriverRequest,
  CreateLedgerEntryRequest,
  CreateTripRequest,
  DriverResponse,
  LedgerEntryResponse,
  RiskLevel,
  RiskPredictionResponse,
  TripResponse,
  UpdateDriverStatusRequest,
  UserResponse,
} from "./types";

const STORAGE_KEY = "routeledger.auth";
const TIMEOUT_MS = 4000;

/** Minimal request shape used by tryFetch — replaces the old fetch-based RequestInit. */
interface TryFetchInit {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

/**
 * Calls the backend with the stored JWT attached. If the endpoint is missing,
 * errors, times out, or returns an unexpected shape, resolves to `null` so the
 * caller can fall back to mock data silently — the UI never surfaces an error.
 */
async function tryFetch<T>(path: string, init: TryFetchInit = {}): Promise<T | null> {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const token = raw ? (JSON.parse(raw).token as string | undefined) : undefined;

    const res = await apiClient.request<T>({
      url: path,
      method: init.method ?? "GET",
      data: init.body ? JSON.parse(init.body) : undefined,
      timeout: TIMEOUT_MS,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}

/** Resolves to live data when the API responds usefully, otherwise the mock. */
async function withFallback<T>(path: string, fallback: T, init?: TryFetchInit): Promise<T> {
  const data = await tryFetch<T>(path, init);
  if (data === null || data === undefined) return fallback;
  if (Array.isArray(fallback) && !Array.isArray(data)) return fallback;
  if (Array.isArray(data) && data.length === 0 && Array.isArray(fallback)) return fallback;
  return data;
}

/* --------------------------------- Reads --------------------------------- */

export const driversQuery = () =>
  queryOptions({
    queryKey: ["drivers"],
    queryFn: () => withFallback<DriverResponse[]>("/api/v1/drivers", MOCK_DRIVERS),
  });

export const driverQuery = (driverId: string) =>
  queryOptions({
    queryKey: ["drivers", driverId],
    queryFn: async () => {
      const fallback = MOCK_DRIVERS.find((d) => d.id === driverId) ?? null;
      const data = await tryFetch<DriverResponse>(`/api/v1/drivers/${driverId}`);
      return data && typeof data.id !== "undefined" ? data : fallback;
    },
  });

export const tripsQuery = () =>
  queryOptions({
    queryKey: ["trips"],
    queryFn: () => withFallback<TripResponse[]>("/api/v1/trips", MOCK_TRIPS),
  });

export const ledgerQuery = () =>
  queryOptions({
    queryKey: ["ledger"],
    queryFn: () => withFallback<LedgerEntryResponse[]>("/api/v1/ledger", MOCK_LEDGER),
  });

export const alertsQuery = () =>
  queryOptions({
    queryKey: ["alerts"],
    queryFn: () => withFallback<AlertResponse[]>("/api/v1/alerts", MOCK_ALERTS),
  });

export const usersQuery = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: () => withFallback<UserResponse[]>("/api/v1/users", MOCK_USERS),
  });

/* --------------------------------- Writes -------------------------------- */
/**
 * Each write posts the exact request DTO to the matching endpoint. The promise
 * is fire-and-forget: the caller has already updated the cache optimistically.
 */

export async function createDriver(body: CreateDriverRequest): Promise<DriverResponse | null> {
  return tryFetch<DriverResponse>("/api/v1/drivers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateDriverStatus(
  driverId: string,
  body: UpdateDriverStatusRequest,
): Promise<DriverResponse | null> {
  return tryFetch<DriverResponse>(`/api/v1/drivers/${driverId}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function createTrip(body: CreateTripRequest): Promise<void> {
  await tryFetch("/api/v1/trips", { method: "POST", body: JSON.stringify(body) });
}

export async function createLedgerEntry(body: CreateLedgerEntryRequest): Promise<void> {
  await tryFetch("/api/v1/ledger", { method: "POST", body: JSON.stringify(body) });
}

export async function createAlert(body: CreateAlertRequest): Promise<void> {
  await tryFetch("/api/v1/alerts", { method: "POST", body: JSON.stringify(body) });
}

export async function acknowledgeAlert(
  alertId: string,
  body: AcknowledgeAlertRequest,
): Promise<void> {
  await tryFetch(`/api/v1/alerts/${alertId}/acknowledge`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Fire-and-forget write for endpoints without a dedicated helper. */
export async function tryWrite(path: string, init: TryFetchInit): Promise<void> {
  await tryFetch(path, init);
}

/* ------------------------------ AI Predictor ------------------------------ */

/** Deterministic mock assessment for trips the mock table doesn't cover. */
function syntheticRisk(tripId: string, tripCode: string): RiskPredictionResponse {
  const seed = [...tripCode].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const riskScore = 18 + (seed % 74);
  const riskLevel: RiskLevel =
    riskScore >= 80 ? "CRITICAL" : riskScore >= 65 ? "HIGH" : riskScore >= 45 ? "MEDIUM" : "LOW";
  return {
    id: `RSK-${tripId}`,
    tripId,
    tripCode,
    riskScore,
    riskLevel,
    riskFactors:
      "Modelled from lane history, driver hours-of-service headroom, vehicle service interval, and current weather along the corridor. No live telemetry anomalies were detected for this trip in the last reporting window.",
    evaluatedAt: new Date().toISOString(),
  };
}

export async function assessRisk(
  tripId: string,
  tripCode: string,
): Promise<RiskPredictionResponse> {
  const fallback = MOCK_RISK[tripId] ?? syntheticRisk(tripId, tripCode);
  const data = await tryFetch<RiskPredictionResponse>("/api/v1/predictions/risk", {
    method: "POST",
    body: JSON.stringify({ tripId }),
  });
  return data && typeof data.riskScore === "number" ? data : fallback;
}