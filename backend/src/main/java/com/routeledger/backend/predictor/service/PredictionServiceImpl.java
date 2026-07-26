package com.routeledger.backend.predictor.service;

import com.routeledger.backend.exception.ResourceNotFoundException;
import com.routeledger.backend.predictor.dto.CreatePredictionRequest;
import com.routeledger.backend.predictor.dto.PredictionResponse;
import com.routeledger.backend.predictor.entity.Prediction;
import com.routeledger.backend.predictor.repository.PredictionRepository;
import com.routeledger.backend.trip.entity.Trip;
import com.routeledger.backend.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PredictionServiceImpl implements PredictionService {

    private final PredictionRepository predictionRepository;
    private final TripRepository tripRepository;

    @Override
    @Transactional
    public PredictionResponse createPrediction(CreatePredictionRequest request) {
        Trip trip = tripRepository.findById(request.tripId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + request.tripId()));

        Prediction prediction = Prediction.builder()
                .trip(trip)
                .riskScore(request.riskScore())
                .riskLevel(request.riskLevel())
                .riskFactors(request.riskFactors())
                .evaluatedAt(LocalDateTime.now())
                .build();

        return mapToResponse(predictionRepository.save(prediction));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PredictionResponse> getPredictionsForTrip(Long tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new ResourceNotFoundException("Trip not found with ID: " + tripId);
        }

        return predictionRepository.findByTripIdOrderByEvaluatedAtDesc(tripId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PredictionResponse mapToResponse(Prediction prediction) {
        return new PredictionResponse(
                prediction.getId(),
                prediction.getTrip().getId(),
                prediction.getTrip().getTripCode(), // Safely accessing lazy-loaded entity properties
                prediction.getRiskScore(),
                prediction.getRiskLevel(),
                prediction.getRiskFactors(),
                prediction.getEvaluatedAt()
        );
    }
}