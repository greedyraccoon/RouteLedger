package com.routeledger.backend.trip.service;

import com.routeledger.backend.driver.entity.Driver;
import com.routeledger.backend.driver.repository.DriverRepository;
import com.routeledger.backend.exception.DuplicateResourceException;
import com.routeledger.backend.exception.ResourceNotFoundException;
import com.routeledger.backend.trip.enums.TripStatus;
import com.routeledger.backend.trip.dto.CreateTripRequest;
import com.routeledger.backend.trip.dto.TripResponse;
import com.routeledger.backend.trip.dto.UpdateTripStatusRequest;
import com.routeledger.backend.trip.entity.Trip;
import com.routeledger.backend.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;

    @Override
    @Transactional
    public TripResponse createTrip(CreateTripRequest request) {
        if (tripRepository.findByTripCode(request.tripCode()).isPresent()) {
            throw new DuplicateResourceException("Trip with code " + request.tripCode() + " already exists.");
        }

        Driver driver = driverRepository.findById(request.driverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + request.driverId()));

        Trip trip = Trip.builder()
                .tripCode(request.tripCode())
                .driver(driver)
                .vehicleNumber(request.vehicleNumber())
                .originName(request.originName())
                .destName(request.destName())
                .cargoType(request.cargoType())
                .cargoWeightTons(request.cargoWeightTons())
                .scheduledDeparture(request.scheduledDeparture())
                .scheduledEta(request.scheduledEta())
                .totalDistanceKm(request.totalDistanceKm())
                .status(TripStatus.SCHEDULED)
                .build();

        return mapToResponse(tripRepository.save(trip));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + id));
        return mapToResponse(trip);
    }

    @Override
    @Transactional
    public TripResponse updateTripStatus(Long id, UpdateTripStatusRequest request) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + id));

        trip.setStatus(request.status());

        // Auto-set actual departure if status changes to DISPATCHED
        if (request.status() == TripStatus.DISPATCHED && trip.getActualDeparture() == null) {
            trip.setActualDeparture(LocalDateTime.now());
        }

        return mapToResponse(tripRepository.save(trip));
    }

    private TripResponse mapToResponse(Trip trip) {
        return new TripResponse(
                trip.getId(),
                trip.getTripCode(),
                trip.getDriver().getId(),
                trip.getDriver().getFullName(), // Triggers lazy load safely within transaction
                trip.getVehicleNumber(),
                trip.getOriginName(),
                trip.getDestName(),
                trip.getCargoType(),
                trip.getCargoWeightTons(),
                trip.getStatus(),
                trip.getScheduledDeparture(),
                trip.getActualDeparture(),
                trip.getScheduledEta(),
                trip.getTotalDistanceKm()
        );
    }
}