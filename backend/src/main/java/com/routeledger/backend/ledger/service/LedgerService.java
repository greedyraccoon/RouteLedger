package com.routeledger.backend.ledger.service;

import com.routeledger.backend.ledger.dto.request.CreateLedgerEntryRequest;
import com.routeledger.backend.ledger.dto.response.LedgerEntryResponse;

import java.util.List;

public interface LedgerService {
    LedgerEntryResponse createEntry(CreateLedgerEntryRequest request);
    List<LedgerEntryResponse> getDriverLedger(Long driverId);
    List<LedgerEntryResponse> getTripLedger(Long tripId);
}