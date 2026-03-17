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
public class PriceExpiryAlertResponse {
    private Integer variantPriceId;
    private Integer variantId;
    private String variantName;
    private String sku;
    private BigDecimal activeSellingPrice;
    private LocalDate expiryDate;
    private Integer daysUntilExpiry;
}
