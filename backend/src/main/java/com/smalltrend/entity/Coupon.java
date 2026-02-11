package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false, length = 50)
    private String type; // PERCENT, FIXED, BXGY, FREE_SHIP

    private BigDecimal value; // percent or amount depending on type
    private Integer maxUses;
    private Integer maxUsesPerCustomer;
    private BigDecimal minOrderValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
    private boolean stackable;
    private String appliesTo; // ORDER or ITEM
    private boolean autoApply;

    private java.time.LocalDateTime createdAt;
}
