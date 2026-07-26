package com.routeledger.backend.driver.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record CreateDriverRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be a valid 10-digit number")
        String phoneNumber,

        @NotBlank(message = "License number is required")
        String licenseNumber,

        @NotNull(message = "License expiry date is required")
        @Future(message = "License must not be expired")
        LocalDate licenseExpiryDate
) {}