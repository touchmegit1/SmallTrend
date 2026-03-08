package com.smalltrend.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockImportRequest {
    private Integer variantId;
    private Integer unitId;
    private Integer quantity;
    private Integer batchId;
    private Integer locationId;
    private String notes;
}
