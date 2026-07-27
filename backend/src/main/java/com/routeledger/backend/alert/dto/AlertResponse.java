package com.routeledger.backend.alert.dto;

import com.routeledger.backend.alert.enums.AlertSeverity;
import com.routeledger.backend.alert.enums.AlertType;

import java.time.LocalDateTime;

public record AlertResponse(
        Long id,
        Long tripId,
        String tripCode,
        AlertType alertType,
        AlertSeverity severity,
        String message,
        Boolean isAcknowledged,
        String acknowledgedBy,
        LocalDateTime createdAt
) {}