package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_item_discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDiscount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "order_item_id", nullable = false)
    private SalesOrderItem orderItem;

    private String sourceType; // COUPON, PROMOTION, MANUAL
    private Integer sourceId; // coupons.id or promotions.id
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;
}
