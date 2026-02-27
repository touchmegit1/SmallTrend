package com.smalltrend.dto.CRM;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CampaignResponse {
    private Integer id;
    private String campaignCode;
    private String campaignName;
    private String campaignType;
    private String description;
    private String bannerImageUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private BigDecimal budget;
    private BigDecimal minPurchaseAmount;
    private Boolean isPublic;
}
