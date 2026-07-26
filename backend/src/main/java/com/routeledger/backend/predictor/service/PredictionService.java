package com.routeledger.backend.predictor.service;

import com.routeledger.backend.predictor.dto.CreatePredictionRequest;
import com.routeledger.backend.predictor.dto.PredictionResponse;

import java.util.List;

public interface PredictionService {
    PredictionResponse createPrediction(CreatePredictionRequest request);
    List<PredictionResponse> getPredictionsForTrip(Long tripId);
}