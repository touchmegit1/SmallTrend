package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true)
    private String sku; // Unique SKU for variant

    private String barcode;

    @Column(name = "sell_price")
    private BigDecimal sellPrice;

    @Column(name = "cost_price") // Adding cost price for variant specific
    private BigDecimal costPrice;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    // Attributes like color, size can be stored as JSON or separate columns if specific
    // For simplicity, we assume variants might be identified by name in Product or separate attributes
    private String size;
    private String color;
}
