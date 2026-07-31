package com.routeledger.backend.alert.service;

import com.routeledger.backend.alert.repository.AlertRepository;
import com.routeledger.backend.alert.dto.AcknowledgeAlertRequest;
import com.routeledger.backend.alert.dto.AlertResponse;
import com.routeledger.backend.alert.dto.CreateAlertRequest;
import com.routeledger.backend.alert.entity.Alert;
import com.routeledger.backend.exception.ResourceNotFoundException;
import com.routeledger.backend.trip.entity.Trip;
import com.routeledger.backend.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;
    private final TripRepository tripRepository;

    @Override
    @Transactional
    public AlertResponse createAlert(CreateAlertRequest request) {
        Trip trip = tripRepository.findById(request.tripId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + request.tripId()));

        Alert alert = Alert.builder()
                .trip(trip)
                .alertType(request.alertType())
                .severity(request.severity())
                .message(request.message())
                .isAcknowledged(false)
                .build();

        return mapToResponse(alertRepository.save(alert));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlertResponse> getUnacknowledgedAlerts() {
        return alertRepository.findByIsAcknowledgedFalseOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsForTrip(Long tripId) {
        return alertRepository.findByTripIdOrderByCreatedAtDesc(tripId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public AlertResponse acknowledgeAlert(Long alertId, AcknowledgeAlertRequest request) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with ID: " + alertId));

        alert.setIsAcknowledged(true);
        alert.setAcknowledgedBy(request.acknowledgedBy());

        return mapToResponse(alertRepository.save(alert));
    }

    @Override
    public List<AlertResponse> getAllAlerts() {
        return alertRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AlertResponse mapToResponse(Alert alert) {
        return new AlertResponse(
                alert.getId(),
                alert.getTrip().getId(),
                alert.getTrip().getTripCode(),
                alert.getAlertType(),
                alert.getSeverity(),
                alert.getMessage(),
                alert.getIsAcknowledged(),
                alert.getAcknowledgedBy(),
                alert.getCreatedAt()
        );
    }
}