package com.routeledger.backend.ai.controller;

import com.routeledger.backend.ai.service.AiEvaluationService;
import com.routeledger.backend.predictor.dto.PredictionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiEvaluationService aiService;

    @PostMapping("/evaluate-trip/{tripId}")
    public ResponseEntity<PredictionResponse> evaluateTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(aiService.evaluateTripRisk(tripId));
    }
}