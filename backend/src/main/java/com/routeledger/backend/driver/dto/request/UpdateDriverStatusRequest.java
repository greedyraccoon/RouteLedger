package com.routeledger.backend.driver.dto.request;

import com.routeledger.backend.driver.enums.DriverStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateDriverStatusRequest(
        @NotNull(message = "Status is required")
        DriverStatus status
) {}