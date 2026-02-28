package com.smalltrend.dto.inventory.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatchResponse {
    private Integer id;
    private String batchCode;
    private Integer productId;
    private String productName;
    private Integer quantity;
    private LocalDate expiryDate;
    private LocalDate receivedDate;
    private BigDecimal costPrice;
}
