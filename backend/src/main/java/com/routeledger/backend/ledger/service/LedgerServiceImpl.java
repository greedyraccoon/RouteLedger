package com.routeledger.backend.ledger.service;

import com.routeledger.backend.driver.entity.Driver;
import com.routeledger.backend.driver.repository.DriverRepository;
import com.routeledger.backend.exception.ResourceNotFoundException;
import com.routeledger.backend.ledger.repository.LedgerEntryRepository;
import com.routeledger.backend.ledger.dto.request.CreateLedgerEntryRequest;
import com.routeledger.backend.ledger.dto.response.LedgerEntryResponse;
import com.routeledger.backend.ledger.entity.LedgerEntry;
import com.routeledger.backend.ledger.enums.TransactionType;
import com.routeledger.backend.trip.entity.Trip;
import com.routeledger.backend.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LedgerServiceImpl implements LedgerService {

    private final LedgerEntryRepository ledgerRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;

    @Override
    @Transactional
    public LedgerEntryResponse createEntry(CreateLedgerEntryRequest request) {
        // 1. PESSIMISTIC LOCK: Lock the driver row so nobody else can touch the balance until this transaction commits.
        Driver driver = driverRepository.findByIdForUpdate(request.driverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + request.driverId()));

        // 2. Fetch Trip (if provided)
        Trip trip = null;
        if (request.tripId() != null) {
            trip = tripRepository.findById(request.tripId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + request.tripId()));
        }

        // 3. Update the Driver's running balance safely in memory
        if (request.transactionType() == TransactionType.CREDIT) {
            driver.setCurrentBalance(driver.getCurrentBalance().add(request.amount()));
        } else {
            driver.setCurrentBalance(driver.getCurrentBalance().subtract(request.amount()));
        }

        // 4. Save the updated Driver (Hibernate executes the UPDATE query)
        driverRepository.save(driver);

        // 5. Create and save the Ledger Entry audit log
        LedgerEntry entry = LedgerEntry.builder()
                .driver(driver)
                .trip(trip)
                .entryType(request.entryType())
                .transactionType(request.transactionType())
                .amount(request.amount())
                .notes(request.notes())
                .build();

        return mapToResponse(ledgerRepository.save(entry));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LedgerEntryResponse> getDriverLedger(Long driverId) {
        return ledgerRepository.findByDriverIdOrderByCreatedAtDesc(driverId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LedgerEntryResponse> getTripLedger(Long tripId) {
        return ledgerRepository.findByTripIdOrderByCreatedAtDesc(tripId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<LedgerEntryResponse> getAllEntries() {
        return ledgerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LedgerEntryResponse mapToResponse(LedgerEntry entry) {
        return new LedgerEntryResponse(
                entry.getId(),
                entry.getDriver().getId(),
                entry.getTrip() != null ? entry.getTrip().getId() : null,
                entry.getEntryType(),
                entry.getTransactionType(),
                entry.getAmount(),
                entry.getNotes(),
                entry.getCreatedAt()
        );
    }
}