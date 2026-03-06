package com.smalltrend.dto.inventory.inventorycount;

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
public class InventoryCountRequest {
    private Integer locationId;
    private String notes;
    private String status; // DRAFT, COUNTING, PENDING, CONFIRMED, REJECTED, CANCELLED
    private String rejectionReason;
    private List<InventoryCountItemRequest> items;
}
