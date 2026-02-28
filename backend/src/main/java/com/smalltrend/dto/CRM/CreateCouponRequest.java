package com.smalltrend.dto.CRM;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateCouponRequest {
    private String couponCode;
    private String couponName;
    private String description;
    private String couponType; // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, BUY_X_GET_Y
    private BigDecimal discountPercent;
    private BigDecimal discountAmount;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minPurchaseAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalUsageLimit;
    private Integer usagePerCustomer;
    private Integer campaignId;
    private String status;
}
