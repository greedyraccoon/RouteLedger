package com.routeledger.backend.alert.service;

import com.routeledger.backend.alert.dto.AcknowledgeAlertRequest;
import com.routeledger.backend.alert.dto.AlertResponse;
import com.routeledger.backend.alert.dto.CreateAlertRequest;

import java.util.List;

public interface AlertService {
    AlertResponse createAlert(CreateAlertRequest request);
    List<AlertResponse> getUnacknowledgedAlerts();
    List<AlertResponse> getAlertsForTrip(Long tripId);
    AlertResponse acknowledgeAlert(Long alertId, AcknowledgeAlertRequest request);

    List<AlertResponse> getAllAlerts();
}