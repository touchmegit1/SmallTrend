package com.smalltrend.dto.CRM;

import lombok.Data;

@Data
public class CreateLoyaltyGiftRequest {
    private Integer variantId;
    private String name;
    private Integer requiredPoints;
    private Integer stock;
}
