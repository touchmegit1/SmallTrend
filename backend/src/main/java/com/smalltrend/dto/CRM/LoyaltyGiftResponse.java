package com.smalltrend.dto.CRM;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LoyaltyGiftResponse {
    private Integer id;
    private Integer variantId;
    private String productName;
    private String sku;
    private String image;
    private String name;
    private Integer requiredPoints;
    private Integer stock;
    private boolean isActive;
    private LocalDateTime createdAt;
}
