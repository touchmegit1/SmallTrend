package com.smalltrend.dto.pos;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SavePurchaseHistoryRequest {
    private Long customerId;
    private String customerName;
    private String paymentMethod;
    private List<PurchaseItem> items;

    @Data
    public static class PurchaseItem {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal subtotal;
    }
}
