package com.routeledger.backend.predictor.controller;

import com.routeledger.backend.predictor.dto.CreatePredictionRequest;
import com.routeledger.backend.predictor.dto.PredictionResponse;
import com.routeledger.backend.predictor.service.PredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping
    public ResponseEntity<PredictionResponse> createPrediction(@Valid @RequestBody CreatePredictionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(predictionService.createPrediction(request));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<PredictionResponse>> getPredictionsForTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(predictionService.getPredictionsForTrip(tripId));
    }
}