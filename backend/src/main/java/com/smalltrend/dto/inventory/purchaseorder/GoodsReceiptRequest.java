package com.smalltrend.dto.inventory.purchaseorder;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceiptRequest {
    private String notes;
    private List<GoodsReceiptItemRequest> items;

    // Additional info collected during CHECKING
    private Integer supplierId;
    private Integer locationId;
    private java.math.BigDecimal discountAmount;
    private java.math.BigDecimal taxAmount;
    private java.math.BigDecimal taxPercent;
    private java.math.BigDecimal subtotal;
    private java.math.BigDecimal totalAmount;
    private java.math.BigDecimal shippingFee;
    private java.math.BigDecimal paidAmount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoodsReceiptItemRequest {
        private Integer itemId;       // PurchaseOrderItem id
        private Integer variantId;
        private Integer receivedQuantity;
        private String notes;         // Ghi chú kiểm kê
        private java.time.LocalDate expiryDate;
        private java.math.BigDecimal importPrice;
    }
}
