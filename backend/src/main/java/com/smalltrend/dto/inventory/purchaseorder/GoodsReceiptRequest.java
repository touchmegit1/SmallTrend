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
public class GoodsReceiptRequest {
    private String notes;
    private Integer supplierId;
    private Integer locationId;
    private BigDecimal taxPercent;
    private BigDecimal shippingFee;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private List<GoodsReceiptItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoodsReceiptItemRequest {
        private Integer itemId;       // PurchaseOrderItem id
        private Integer variantId;
        private Integer receivedQuantity;
        private java.math.BigDecimal unitCost;
        private java.time.LocalDate expiryDate;
        private String notes;         // Ghi chú kiểm kê
    }
}
