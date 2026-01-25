package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;
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
    @JoinColumn(name = "from_bin_id")
    private ShelfBin fromBin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_bin_id")
    private ShelfBin toBin;

    private int quantity;

    // Type: INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT
    private String type;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
