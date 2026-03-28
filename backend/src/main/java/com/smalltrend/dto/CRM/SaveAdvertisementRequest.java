package com.smalltrend.dto.CRM;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SaveAdvertisementRequest {
    private String slot;           // LEFT | RIGHT
    private String sponsorName;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String linkUrl;
    private String ctaText;
    private String ctaColor;
    private String bgColor;
    private Boolean isActive;
}
