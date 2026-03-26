package com.smalltrend.dto.inventory.purchase;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItemResponse {
    private Integer id;
    private Integer productId;
    private Integer variantId;
    private String sku;
    private String name;
    private String imageUrl;
    private Map<String, String> attributes;
    private String unit;
    private String checkingUnit;
    private Integer quantity;
    private Integer checkingQuantity;
    private Integer conversionFactor;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private Integer receivedQuantity;
    private String notes;
    private java.time.LocalDate expiryDate;
}
