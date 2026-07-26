package com.routeledger.backend.alert.entity;

import com.routeledger.backend.alert.enums.AlertSeverity;
import com.routeledger.backend.alert.enums.AlertType;
import com.routeledger.backend.common.BaseEntity;
import com.routeledger.backend.trip.entity.Trip;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Alert extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertSeverity severity;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAcknowledged = false;

    // Stores the username/ID of the dispatcher who cleared the alert
    private String acknowledgedBy;
}