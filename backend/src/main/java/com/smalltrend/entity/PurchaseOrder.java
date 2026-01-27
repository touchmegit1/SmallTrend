package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private LocalDate orderDate;
    private String supplierNameText;
    private String status;
    private BigDecimal totalAmount;

    @ManyToOne
    @JoinColumn(name = "received_by")
    private User receivedBy;

    @OneToMany(mappedBy = "purchaseOrder")
    private List<PurchaseOrderItem> items;
}
