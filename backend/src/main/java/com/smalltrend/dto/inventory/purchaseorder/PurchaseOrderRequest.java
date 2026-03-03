package com.smalltrend.dto.inventory.purchaseorder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderRequest {
    private String poNumber;
    private Integer supplierId;
    private String supplierName;
    private Integer locationId;
    private String status;

    // Financials
    private BigDecimal discount;
    private BigDecimal taxPercent;
    private BigDecimal shippingFee;
    private BigDecimal paidAmount;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal remainingAmount;

    private String notes;
    private Integer createdBy;

    // Items
    private List<PurchaseOrderItemRequest> items;
}
