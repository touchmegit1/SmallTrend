package com.smalltrend.dto.Module1;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVariantRespone {
    private Integer id;
    private String name;        // Tên product
    private String sku;
    private BigDecimal sellPrice;
    private String imageUrl;    // Ảnh variant (hoặc product)
    private boolean isActive;

    // Coupon info (nullable)
    private Integer couponId;
    private String couponCode;
    private String couponName;
    private String couponType;         // PERCENTAGE, FIXED_AMOUNT, ...
    private BigDecimal discountPercent;
    private BigDecimal discountAmount;

    // Giá sau giảm (tính sẵn)
    private BigDecimal discountedPrice;
}