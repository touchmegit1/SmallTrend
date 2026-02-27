package com.smalltrend.dto.CRM;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CouponResponse {
    private Integer id;
    private String couponCode;
    private String couponName;
    private String description;
    private String couponType;
    private BigDecimal discountPercent;
    private BigDecimal discountAmount;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minPurchaseAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalUsageLimit;
    private Integer usagePerCustomer;
    private Integer currentUsageCount;
    private String status;
    private Integer campaignId;
    private String campaignName;
}
