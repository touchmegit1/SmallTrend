package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "catalog_price_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogPriceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false, length = 20)
    private String discountType; // PERCENT, FIXED, SET_PRICE

    @Column(nullable = false)
    private BigDecimal discountValue;

    private LocalDate startDate;
    private LocalDate endDate;
    private Integer priority;
    private boolean applyToSaleItems;
    private boolean stopFurtherRules;
    private boolean isActive;
    private java.time.LocalDateTime createdAt;
}
