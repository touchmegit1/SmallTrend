package com.smalltrend.dto.products;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VariantPriceResponse {
    private Integer id;
    private Integer variantId;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private BigDecimal taxPercent;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private String status;
    private LocalDateTime createdAt;
}
