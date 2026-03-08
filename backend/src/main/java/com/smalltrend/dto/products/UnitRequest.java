package com.smalltrend.dto.products;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UnitRequest {
    private String code;
    private String name;
    private String materialType;
    private String symbol;
    private BigDecimal defaultSellPrice;
    private BigDecimal defaultCostPrice;
}
