/**
 * Backend DTOs. These mirror the Java/Spring response + request records
 * one-to-one, so the frontend speaks exactly the same field names as the API.
 */

/* ---------------------------------- Auth --------------------------------- */

export type Role = "SYSTEM_ADMIN" | "FINANCE_ADMIN" | "DISPATCHER";
export const ROLES: Role[] = ["SYSTEM_ADMIN", "FINANCE_ADMIN", "DISPATCHER"];

/** POST /api/v1/auth/google */
export interface GoogleLoginRequest {
  idToken: string;
}

/** 200 OK from POST /api/v1/auth/google */
export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  pictureUrl: string;
  role: Role;
}

/** The user slice of AuthResponse, also returned by GET /api/v1/users */
export interface UserResponse {
  email: string;
  name: string;
  pictureUrl: string;
  role: Role;
}

/* --------------------------------- Driver -------------------------------- */

export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
export const DRIVER_STATUSES: DriverStatus[] = [
  "AVAILABLE",
  "ON_TRIP",
  "OFF_DUTY",
  "SUSPENDED",
];

export interface DriverResponse {
  id: string;
  fullName: string;
  phoneNumber: string;
  licenseNumber: string;
  /** ISO date string */
  licenseExpiryDate: string;
  status: DriverStatus;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverRequest {
  fullName: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
}

export interface UpdateDriverStatusRequest {
  status: DriverStatus;
}

/* ---------------------------------- Trip --------------------------------- */

export type TripStatus =
  | "SCHEDULED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELAYED"
  | "COMPLETED"
  | "CANCELLED";

export const TRIP_STATUSES: TripStatus[] = [
  "SCHEDULED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELAYED",
  "COMPLETED",
  "CANCELLED",
];

export interface TripResponse {
  id: string;
  tripCode: string;
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  originName: string;
  destName: string;
  cargoType: string;
  cargoWeightTons: number;
  status: TripStatus;
  scheduledDeparture: string;
  actualDeparture: string | null;
  scheduledEta: string;
  totalDistanceKm: number;
}

export interface CreateTripRequest {
  tripCode: string;
  driverId: string;
  vehicleNumber: string;
  originName: string;
  destName: string;
  cargoType: string;
  cargoWeightTons: number;
  scheduledDeparture: string;
  scheduledEta: string;
  totalDistanceKm: number;
}

/* --------------------------------- Ledger -------------------------------- */

export type LedgerEntryType =
  | "TRIP_ADVANCE"
  | "FUEL_ALLOWANCE"
  | "TOLL_REIMBURSEMENT"
  | "PENALTY"
  | "FINAL_SETTLEMENT";

export const LEDGER_ENTRY_TYPES: LedgerEntryType[] = [
  "TRIP_ADVANCE",
  "FUEL_ALLOWANCE",
  "TOLL_REIMBURSEMENT",
  "PENALTY",
  "FINAL_SETTLEMENT",
];

export type TransactionType = "CREDIT" | "DEBIT";
export const TRANSACTION_TYPES: TransactionType[] = ["CREDIT", "DEBIT"];

export interface LedgerEntryResponse {
  id: string;
  driverId: string;
  tripId: string | null;
  entryType: LedgerEntryType;
  transactionType: TransactionType;
  amount: number;
  notes: string | null;
  createdAt: string;
}

export interface CreateLedgerEntryRequest {
  driverId: string;
  tripId: string | null;
  entryType: LedgerEntryType;
  transactionType: TransactionType;
  amount: number;
  notes: string | null;
}

/* ------------------------------ AI Predictor ------------------------------ */

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskPredictionResponse {
  id: string;
  tripId: string;
  tripCode: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: string;
  evaluatedAt: string;
}

/* --------------------------------- Alerts -------------------------------- */

export type AlertType =
  | "SLA_BREACH_PREDICTED"
  | "ROUTE_DEVIATION"
  | "UNACKNOWLEDGED_DELAY"
  | "LICENCE_EXPIRY";

export const ALERT_TYPES: AlertType[] = [
  "SLA_BREACH_PREDICTED",
  "ROUTE_DEVIATION",
  "UNACKNOWLEDGED_DELAY",
  "LICENCE_EXPIRY",
];

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export const ALERT_SEVERITIES: AlertSeverity[] = ["INFO", "WARNING", "CRITICAL"];

export interface AlertResponse {
  id: string;
  tripId: string;
  tripCode: string;
  alertType: AlertType;
  alertSeverity: AlertSeverity;
  message: string;
  isAcknowledged: boolean;
  acknowledgedBy: string | null;
  createdAt: string;
}

export interface CreateAlertRequest {
  tripId: string;
  alertType: AlertType;
  alertSeverity: AlertSeverity;
  message: string;
}

export interface AcknowledgeAlertRequest {
  acknowledgedBy: string;
}
