package com.routeledger.backend.security.controller;

import com.routeledger.backend.security.service.GoogleAuthService;
import com.routeledger.backend.security.dto.AuthResponse;
import com.routeledger.backend.security.dto.GoogleLoginRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GoogleAuthService googleAuthService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(googleAuthService.authenticateGoogleUser(request));
    }
}