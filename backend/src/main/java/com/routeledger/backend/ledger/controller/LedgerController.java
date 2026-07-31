package com.routeledger.backend.ledger.controller;

import com.routeledger.backend.ledger.service.LedgerService;
import com.routeledger.backend.ledger.dto.request.CreateLedgerEntryRequest;
import com.routeledger.backend.ledger.dto.response.LedgerEntryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @PostMapping
    public ResponseEntity<LedgerEntryResponse> createLedgerEntry(@Valid @RequestBody CreateLedgerEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ledgerService.createEntry(request));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<LedgerEntryResponse>> getLedgerByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(ledgerService.getDriverLedger(driverId));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<LedgerEntryResponse>> getLedgerByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(ledgerService.getTripLedger(tripId));
    }

    @GetMapping
    public ResponseEntity<List<LedgerEntryResponse>> getAllEntries() {
        return ResponseEntity.ok(ledgerService.getAllEntries());
    }
}