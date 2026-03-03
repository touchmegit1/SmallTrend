package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "sale_order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "product_name", length = 200)
    private String productName;

    @Column(name = "sku", length = 100)
    private String sku;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "line_discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal lineDiscountAmount = BigDecimal.ZERO;

    @Column(name = "line_tax_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal lineTaxAmount = BigDecimal.ZERO;

    @Column(name = "line_total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal lineTotalAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;
}