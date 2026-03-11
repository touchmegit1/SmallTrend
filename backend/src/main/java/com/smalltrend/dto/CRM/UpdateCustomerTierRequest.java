package com.smalltrend.dto.CRM;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateCustomerTierRequest {
    private String tierName;
    private BigDecimal minSpending;
    private BigDecimal pointsMultiplier;
    private String color;
    private String description;
    private Boolean isActive;
}
