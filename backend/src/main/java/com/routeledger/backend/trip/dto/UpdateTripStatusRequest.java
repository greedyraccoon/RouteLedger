package com.routeledger.backend.trip.dto;

import com.routeledger.backend.trip.enums.TripStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTripStatusRequest(
        @NotNull(message = "Status is required")
        TripStatus status
) {}