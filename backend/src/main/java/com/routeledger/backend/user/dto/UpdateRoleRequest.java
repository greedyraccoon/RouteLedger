package com.routeledger.backend.user.dto;

import com.routeledger.backend.user.enums.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull(message = "Role is required")
        Role role
) {}