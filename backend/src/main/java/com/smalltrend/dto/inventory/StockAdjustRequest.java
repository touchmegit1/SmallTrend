package com.smalltrend.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustRequest {
    private Integer variantId;
    private Integer batchId;
    private Integer locationId;
    private Integer adjustQuantity; // the difference (+/-)
    private String reason;
}
