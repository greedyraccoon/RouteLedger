package com.routeledger.backend.user.controller;

import com.routeledger.backend.user.service.UserService;
import com.routeledger.backend.user.dto.UpdateRoleRequest;
import com.routeledger.backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Only SYSTEM_ADMIN or FINANCE_ADMIN can list all users
    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'FINANCE_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ONLY SYSTEM_ADMIN can promote/demote user roles
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        return ResponseEntity.ok(userService.updateUserRole(id, request));
    }
}