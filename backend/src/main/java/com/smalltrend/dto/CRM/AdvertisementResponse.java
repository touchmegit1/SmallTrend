package com.smalltrend.dto.CRM;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AdvertisementResponse {
    private Long id;
    private String slot;
    private String sponsorName;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String linkUrl;
    private String ctaText;
    private String ctaColor;
    private String bgColor;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
