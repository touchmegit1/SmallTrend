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
    // Contract fields
    private String contractNumber;
    private BigDecimal contractValue;
    private LocalDate contractStart;
    private LocalDate contractEnd;
    private String paymentTerms;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
