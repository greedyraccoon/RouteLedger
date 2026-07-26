package com.routeledger.backend.driver.dto.response;

import com.routeledger.backend.driver.enums.DriverStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DriverResponse(
        Long id,
        String fullName,
        String phoneNumber,
        String licenseNumber,
        LocalDate licenseExpiryDate,
        DriverStatus status,
        BigDecimal currentBalance,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}