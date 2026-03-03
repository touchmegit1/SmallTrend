package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String action; // e.g., UPDATE_PROFILE, LOGIN, GRANT_ROLE, DELETE

    private String entityName; // Target entity type

    private Integer entityId; // FK to changed entity

    @Column(name = "changes", columnDefinition = "TEXT")
    private String changes; // JSON or text detailing the change

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private String result; // OK, FAIL, DENIED

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "trace_id")
    private String traceId; // Correlation/Trace ID

    private String source; // Source of the action (e.g., WEB, API, MOBILE)

    private String details; // Additional details
}
