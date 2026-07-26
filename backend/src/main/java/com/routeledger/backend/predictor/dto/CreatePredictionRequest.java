package com.routeledger.backend.predictor.dto;

import com.routeledger.backend.predictor.enums.RiskLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreatePredictionRequest(
        @NotNull(message = "Trip ID is required")
        Long tripId,

        @NotNull(message = "Risk score is required")
        @Min(value = 0, message = "Risk score cannot be less than 0")
        @Max(value = 100, message = "Risk score cannot exceed 100")
        Integer riskScore,

        @NotNull(message = "Risk level is required")
        RiskLevel riskLevel,

        @NotBlank(message = "Risk factors must be provided")
        String riskFactors
) {}