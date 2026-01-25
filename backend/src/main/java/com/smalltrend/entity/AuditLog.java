package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;
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
    private Long id;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE, LOGIN

    @Column(name = "entity_name")
    private String entityName; // Product, Order, User

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "details", length = 1000)
    private String details; // JSON or text details

    @Column(name = "performed_by")
    private String performedBy; // Username

    @Column(name = "performed_at")
    private LocalDateTime performedAt;

    @PrePersist
    protected void onCreate() {
        performedAt = LocalDateTime.now();
    }
}
