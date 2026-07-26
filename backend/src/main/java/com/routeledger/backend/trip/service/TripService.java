package com.routeledger.backend.trip.service;

import com.routeledger.backend.trip.dto.CreateTripRequest;
import com.routeledger.backend.trip.dto.TripResponse;
import com.routeledger.backend.trip.dto.UpdateTripStatusRequest;

import java.util.List;

public interface TripService {
    TripResponse createTrip(CreateTripRequest request);
    List<TripResponse> getAllTrips();
    TripResponse getTripById(Long id);
    TripResponse updateTripStatus(Long id, UpdateTripStatusRequest request);
}