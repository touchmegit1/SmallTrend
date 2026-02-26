package com.smalltrend.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequest {

    private Integer productVariantId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineDiscountAmount;
    private BigDecimal lineTaxAmount;
    private String notes;
}
