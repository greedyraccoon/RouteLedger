package com.routeledger.backend.alert.dto;

import com.routeledger.backend.alert.enums.AlertSeverity;
import com.routeledger.backend.alert.enums.AlertType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAlertRequest(
        @NotNull(message = "Trip ID is required")
        Long tripId,

        @NotNull(message = "Alert type is required")
        AlertType alertType,

        @NotNull(message = "Severity is required")
        AlertSeverity severity,

        @NotBlank(message = "Message is required")
        String message
) {}