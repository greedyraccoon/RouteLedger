package com.routeledger.backend.user.dto;

import com.routeledger.backend.user.enums.Role;

public record UserResponse(
        Long id,
        String email,
        String name,
        String pictureUrl,
        Role role
) {}