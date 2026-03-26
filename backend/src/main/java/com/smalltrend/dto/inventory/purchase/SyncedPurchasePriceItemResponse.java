package com.smalltrend.dto.inventory.purchase;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncedPurchasePriceItemResponse {
    private Integer variantId;
    private String productName;
    private String sku;
    private BigDecimal purchasePrice;
}
