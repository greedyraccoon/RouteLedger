package com.routeledger.backend.alert.controller;

import com.routeledger.backend.alert.dto.AcknowledgeAlertRequest;
import com.routeledger.backend.alert.dto.AlertResponse;
import com.routeledger.backend.alert.dto.CreateAlertRequest;
import com.routeledger.backend.alert.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<AlertResponse> createAlert(@Valid @RequestBody CreateAlertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.createAlert(request));
    }

    @GetMapping("/unacknowledged")
    public ResponseEntity<List<AlertResponse>> getUnacknowledgedAlerts() {
        return ResponseEntity.ok(alertService.getUnacknowledgedAlerts());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<AlertResponse>> getAlertsForTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(alertService.getAlertsForTrip(tripId));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<AlertResponse> acknowledgeAlert(
            @PathVariable Long id,
            @Valid @RequestBody AcknowledgeAlertRequest request) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(id, request));
    }

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }
}