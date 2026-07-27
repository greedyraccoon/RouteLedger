package com.routeledger.backend.security.dto;

import com.routeledger.backend.user.entity.Role;

public record AuthResponse(
        String token,
        String email,
        String name,
        String pictureUrl,
        Role role
) {}