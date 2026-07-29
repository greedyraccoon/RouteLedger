package com.routeledger.backend.driver.service;

import com.routeledger.backend.driver.dto.request.CreateDriverRequest;
import com.routeledger.backend.driver.dto.request.UpdateDriverStatusRequest;
import com.routeledger.backend.driver.dto.response.DriverResponse;
import com.routeledger.backend.driver.entity.Driver;
import com.routeledger.backend.driver.repository.DriverRepository;
import com.routeledger.backend.exception.DuplicateResourceException;
import com.routeledger.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;

    @Override
    @Transactional
    public DriverResponse createDriver(CreateDriverRequest request) {
        if (driverRepository.findByLicenseNumber(request.licenseNumber()).isPresent()) {
            throw new DuplicateResourceException("Driver with license number " + request.licenseNumber() + " already exists.");
        }
        if (driverRepository.findByPhoneNumber(request.phoneNumber()).isPresent()) {
            throw new DuplicateResourceException("Driver with phone number " + request.phoneNumber() + " already exists.");
        }

        Driver driver = Driver.builder()
                .fullName(request.fullName())
                .phoneNumber(request.phoneNumber())
                .licenseNumber(request.licenseNumber())
                .licenseExpiryDate(request.licenseExpiryDate())
                .build();

        return mapToResponse(driverRepository.save(driver));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DriverResponse getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
        return mapToResponse(driver);
    }


    @Override
    @Transactional
    public DriverResponse updateDriverStatus(Long id, UpdateDriverStatusRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));

        driver.setStatus(request.status());
        return mapToResponse(driverRepository.save(driver));
    }

    private DriverResponse mapToResponse(Driver driver) {
        return new DriverResponse(
                driver.getId(),
                driver.getFullName(),
                driver.getPhoneNumber(),
                driver.getLicenseNumber(),
                driver.getLicenseExpiryDate(),
                driver.getStatus(),
                driver.getCurrentBalance(),
                driver.getCreatedAt(),
                driver.getUpdatedAt()
        );
    }
}