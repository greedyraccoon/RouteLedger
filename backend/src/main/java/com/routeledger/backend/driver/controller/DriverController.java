package com.routeledger.backend.driver.controller;

import com.routeledger.backend.driver.dto.CreateDriverRequest;
import com.routeledger.backend.driver.dto.response.DriverResponse;
import com.routeledger.backend.driver.dto.request.UpdateDriverStatusRequest;
import com.routeledger.backend.driver.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        DriverResponse created = driverService.createDriver(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DriverResponse> updateDriverStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDriverStatusRequest request
    ) {
        return ResponseEntity.ok(driverService.updateDriverStatus(id, request));
    }
}