package com.smalltrend.dto.inventory.inventorycount;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountItemRequest {
    private Integer productId;
    private Integer systemQuantity;
    private Integer actualQuantity;
    private Integer differenceQuantity;
    private BigDecimal differenceValue;
    private String reason;
}
