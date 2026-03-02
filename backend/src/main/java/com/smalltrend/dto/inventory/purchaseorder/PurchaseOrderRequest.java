package com.smalltrend.dto.inventory.purchaseorder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderRequest {
    private String orderNumber;
    private Integer supplierId;
    private Integer createdBy;
    private LocalDate expectedDeliveryDate;
    private String status;

    // Financials
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal subtotal;
    private BigDecimal totalAmount;

    private String notes;

    // Items
    private List<PurchaseOrderItemRequest> items;
}
