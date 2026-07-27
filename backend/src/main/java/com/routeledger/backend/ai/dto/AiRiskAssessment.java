package com.routeledger.backend.ai.dto;

import com.routeledger.backend.predictor.enums.RiskLevel;

public record AiRiskAssessment(
        Integer riskScore,
        RiskLevel riskLevel,
        String riskFactors
) {}