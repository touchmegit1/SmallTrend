package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(nullable = false)
    private String type; // IN, OUT, ADJUST

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "reference_type")
    private String referenceType; // purchase_order, disposal, inventory_count

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
