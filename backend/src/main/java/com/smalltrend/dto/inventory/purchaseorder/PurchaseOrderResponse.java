package com.smalltrend.dto.inventory.purchaseorder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
    private Integer id;
    private String poNumber;

    // Supplier info
    private Integer supplierId;
    private String supplierName;

    // Location
    private Integer locationId;
    private String locationName;

    // Status & dates
    private String status;
    private LocalDate orderDate;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;

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
    private String receivedByName;

    // Items (only for detail view)
    private List<PurchaseOrderItemResponse> items;
}
