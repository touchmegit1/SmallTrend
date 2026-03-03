package com.smalltrend.dto.inventory.inventorycount;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountResponse {
    private Integer id;
    private String code;
    private String status;

    private Integer locationId;
    private String locationName;

    private String notes;

    private BigDecimal totalShortageValue;
    private BigDecimal totalOverageValue;
    private BigDecimal totalDifferenceValue;

    private Integer createdBy;
    private Integer confirmedBy;

    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;

    private List<InventoryCountItemResponse> items;
}
