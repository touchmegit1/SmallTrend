package com.smalltrend.dto.inventory.location;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationStockItemResponse {
    private Integer variantId;
    private String sku;
    private String productName;
    private String variantUnit;
    private Integer quantity;
    private String batchCode;
    private Integer batchId;
}
