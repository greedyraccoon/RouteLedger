package com.routeledger.backend.driver.service;

import com.routeledger.backend.driver.dto.CreateDriverRequest;
import com.routeledger.backend.driver.dto.request.UpdateDriverStatusRequest;
import com.routeledger.backend.driver.dto.response.DriverResponse;


import java.util.List;

public interface DriverService {

    DriverResponse createDriver(CreateDriverRequest request);

    List<DriverResponse> getAllDrivers();

    DriverResponse getDriverById(Long id);

    DriverResponse updateDriverStatus(Long id, UpdateDriverStatusRequest request);
}