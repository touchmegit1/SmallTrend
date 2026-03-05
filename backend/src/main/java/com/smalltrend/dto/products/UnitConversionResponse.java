package com.smalltrend.dto.products;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UnitConversionResponse {
    private Integer id;
    private Integer variantId;
    private Integer toUnitId;
    private String toUnitName;
    private String toUnitCode;
    private BigDecimal conversionFactor;
    private BigDecimal sellPrice;
    private String description;
    private Boolean isActive;
}
