package com.smalltrend.dto.inventory.purchaseorder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceiptRequest {
    private String notes;
    private List<GoodsReceiptItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoodsReceiptItemRequest {
        private Integer itemId;       // PurchaseOrderItem id
        private Integer variantId;
        private Integer receivedQuantity;
        private String notes;         // Ghi chú kiểm kê
    }
}
