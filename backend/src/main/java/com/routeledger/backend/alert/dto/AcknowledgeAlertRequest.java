package com.routeledger.backend.alert.dto;

import jakarta.validation.constraints.NotBlank;

public record AcknowledgeAlertRequest(
        @NotBlank(message = "Acknowledged By is required")
        String acknowledgedBy
) {}