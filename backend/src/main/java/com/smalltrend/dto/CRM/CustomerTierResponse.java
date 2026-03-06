package com.smalltrend.dto.CRM;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CustomerTierResponse {
    private Integer id;
    private String tierCode;
    private String tierName;
    private BigDecimal minSpending;
    private BigDecimal pointsMultiplier;
    private BigDecimal discountRate;
    private BigDecimal bonusPoints;
    private String color;
    private Boolean isActive;
    private Integer priority;
    private String description;
}

