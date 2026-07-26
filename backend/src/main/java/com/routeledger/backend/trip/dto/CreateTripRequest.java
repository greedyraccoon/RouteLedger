package com.routeledger.backend.trip.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record CreateTripRequest(
        @NotBlank(message = "Trip code is required")
        String tripCode,

        @NotNull(message = "Driver ID is required")
        Long driverId,

        @NotBlank(message = "Vehicle number is required")
        String vehicleNumber,

        @NotBlank(message = "Origin name is required")
        String originName,

        @NotBlank(message = "Destination name is required")
        String destName,

        @NotBlank(message = "Cargo type is required")
        String cargoType,

        @NotNull(message = "Cargo weight is required")
        @Positive(message = "Cargo weight must be positive")
        Double cargoWeightTons,

        @NotNull(message = "Scheduled departure is required")
        LocalDateTime scheduledDeparture,

        @NotNull(message = "Scheduled ETA is required")
        @Future(message = "Scheduled ETA must be in the future")
        LocalDateTime scheduledEta,

        @NotNull(message = "Total distance is required")
        @Positive(message = "Distance must be positive")
        Double totalDistanceKm
) {}