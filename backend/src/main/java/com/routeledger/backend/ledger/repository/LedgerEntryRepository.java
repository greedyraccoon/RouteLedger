package com.routeledger.backend.ledger.repository;

import com.routeledger.backend.ledger.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {
    List<LedgerEntry> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<LedgerEntry> findByTripIdOrderByCreatedAtDesc(Long tripId);
}