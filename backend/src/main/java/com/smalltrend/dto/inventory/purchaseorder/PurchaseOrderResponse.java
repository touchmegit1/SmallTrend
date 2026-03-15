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
    private String orderNumber;

    // Supplier info
    private Integer locationId;
    private Integer supplierId;
    private String supplierName;

    // Contract info
    private Long contractId;
    private String contractNumber;
    private String contractTitle;

    // User info
    private Integer createdById;
    private String createdByName;

    // Dates & Status
    private String status;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Financials
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal taxPercent;
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
    private BigDecimal shippingFee;
    private BigDecimal paidAmount;

    private String notes;
    private String rejectionReason;
    private Integer syncedPurchasePriceCount;

    // Items
    private List<PurchaseOrderItemResponse> items;
}
