package com.smalltrend.dto.products;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UnitConversionRequest {
    private Integer toUnitId;
    private BigDecimal conversionFactor;
    private BigDecimal sellPrice;
    private String description;
    private Boolean isActive;
}
