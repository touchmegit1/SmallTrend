package com.smalltrend.dto.CRM;

import lombok.Data;

@Data
public class UpdateLoyaltyGiftRequest {
    private String name;
    private Integer requiredPoints;
    private Integer stock;
}