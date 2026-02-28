package com.smalltrend.dto.inventory.purchaseorder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchRequest {
    private String batchCode;
    private Integer quantity;
    private String expiryDate;
}
