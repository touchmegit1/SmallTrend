package com.smalltrend.dto.products;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class VariantPriceRequest {
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private BigDecimal taxPercent;
    private LocalDate effectiveDate;
}
