package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "inventory_stock")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bin_id")
    private ShelfBin bin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    private int quantity;
}
