package com.routeledger.backend.trip.dto;

import com.routeledger.backend.trip.enums.TripStatus;

import java.time.LocalDateTime;

public record TripResponse(
        Long id,
        String tripCode,
        Long driverId,
        String driverName,
        String vehicleNumber,
        String originName,
        String destName,
        String cargoType,
        Double cargoWeightTons,
        TripStatus status,
        LocalDateTime scheduledDeparture,
        LocalDateTime actualDeparture,
        LocalDateTime scheduledEta,
        Double totalDistanceKm
) {}