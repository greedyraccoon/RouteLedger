package com.routeledger.backend.alert.repository;

import com.routeledger.backend.alert.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByTripIdOrderByCreatedAtDesc(Long tripId);
    List<Alert> findByIsAcknowledgedFalseOrderByCreatedAtDesc();
}