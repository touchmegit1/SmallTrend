package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_item_taxes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemTax {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "order_item_id", nullable = false)
    private SalesOrderItem orderItem;

    @Column(nullable = false)
    private String taxName;

    @Column(nullable = false)
    private Double taxRate;

    private BigDecimal taxAmount;
}
