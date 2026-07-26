package com.routeledger.backend.ledger.dto.request;

import com.routeledger.backend.ledger.enums.EntryType;
import com.routeledger.backend.ledger.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateLedgerEntryRequest(
        @NotNull(message = "Driver ID is required")
        Long driverId,

        Long tripId, // Optional

        @NotNull(message = "Entry type is required")
        EntryType entryType,

        @NotNull(message = "Transaction type is required")
        TransactionType transactionType,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be strictly positive")
        BigDecimal amount,

        String notes
) {}