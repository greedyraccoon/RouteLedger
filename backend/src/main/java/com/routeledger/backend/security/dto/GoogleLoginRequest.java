package com.routeledger.backend.security.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
        @NotBlank(message = "Id Token is required")
        String idToken
) {}