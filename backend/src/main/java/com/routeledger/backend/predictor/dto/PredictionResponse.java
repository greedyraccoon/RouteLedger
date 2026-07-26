package com.routeledger.backend.predictor.dto;

import com.routeledger.backend.predictor.enums.RiskLevel;
import java.time.LocalDateTime;

public record PredictionResponse(
        Long id,
        Long tripId,
        String tripCode,
        Integer riskScore,
        RiskLevel riskLevel,
        String riskFactors,
        LocalDateTime evaluatedAt
) {}