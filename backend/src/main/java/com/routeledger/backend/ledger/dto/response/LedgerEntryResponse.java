package com.routeledger.backend.ledger.dto.response;

import com.routeledger.backend.ledger.enums.EntryType;
import com.routeledger.backend.ledger.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LedgerEntryResponse(
        Long id,
        Long driverId,
        Long tripId,
        EntryType entryType,
        TransactionType transactionType,
        BigDecimal amount,
        String notes,
        LocalDateTime createdAt
) {}