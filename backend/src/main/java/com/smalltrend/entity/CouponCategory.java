package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coupon_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
