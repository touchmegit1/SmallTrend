package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "promotion_conditions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionCondition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    @Column(name = "min_order_value")
    private BigDecimal minOrderValue;

    // Can add product specific conditions
    // @ManyToOne Product product;

    @Column(name = "discount_percent")
    private Double discountPercent; // Specific override
}
