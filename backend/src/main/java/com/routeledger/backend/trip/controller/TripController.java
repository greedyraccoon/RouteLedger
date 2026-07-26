package com.routeledger.backend.trip.controller;

import com.routeledger.backend.trip.service.TripService;
import com.routeledger.backend.trip.dto.CreateTripRequest;
import com.routeledger.backend.trip.dto.TripResponse;
import com.routeledger.backend.trip.dto.UpdateTripStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody CreateTripRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(request));
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TripResponse> updateTripStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTripStatusRequest request) {
        return ResponseEntity.ok(tripService.updateTripStatus(id, request));
    }
}