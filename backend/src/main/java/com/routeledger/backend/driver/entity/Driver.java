package com.routeledger.backend.driver.entity;

import com.routeledger.backend.common.BaseEntity;
import com.routeledger.backend.driver.enums.DriverStatus;
import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Column(nullable = false)
    private LocalDate licenseExpiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DriverStatus status = DriverStatus.AVAILABLE;

    // Running ledger balance: Negative = owes company, Positive = company owes driver
    @Column(nullable = false)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;
}