package com.routeledger.backend.predictor.repository;

import com.routeledger.backend.predictor.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    // Fetches the most recent predictions for a trip first
    List<Prediction> findByTripIdOrderByEvaluatedAtDesc(Long tripId);
}