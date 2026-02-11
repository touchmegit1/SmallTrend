package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coupon_customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponCustomer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
}
