package com.smalltrend.dto.inventory.disposal;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpiredBatchResponse {
    private Long batchId;
    private Long productId;
    private String productName;
    private String sku;
    private String batchCode;
    private Integer availableQuantity;
    private BigDecimal unitCost;
    private BigDecimal totalValue;
    private LocalDate expiryDate;
    private Integer daysExpired;
}
