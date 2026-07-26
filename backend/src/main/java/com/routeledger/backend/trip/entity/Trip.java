package com.routeledger.backend.trip.entity;

import com.routeledger.backend.common.BaseEntity;
import com.routeledger.backend.driver.entity.Driver;
import com.routeledger.backend.trip.enums.TripStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Trip extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tripCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    private String originName;

    @Column(nullable = false)
    private String destName;

    @Column(nullable = false)
    private String cargoType;

    @Column(nullable = false)
    private Double cargoWeightTons;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TripStatus status = TripStatus.SCHEDULED;

    @Column(nullable = false)
    private LocalDateTime scheduledDeparture;

    private LocalDateTime actualDeparture;

    @Column(nullable = false)
    private LocalDateTime scheduledEta;

    @Column(nullable = false)
    private Double totalDistanceKm;
}