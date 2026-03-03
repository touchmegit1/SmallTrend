package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_count_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryCountItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "inventory_count_id")
    private InventoryCount inventoryCount;

    private Integer productId;

    private Integer systemQuantity;
    private Integer actualQuantity;
    private Integer differenceQuantity;

    private BigDecimal differenceValue;

    private String reason;
}
