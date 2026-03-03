package com.smalltrend.dto.inventory.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Stock movement response matching the frontend shape.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
    private Integer id;
    private Integer variantId;
    private Integer fromBinId;
    private Integer toBinId;
    private Integer quantity;
    private String type;
    private String createdAt;
}
