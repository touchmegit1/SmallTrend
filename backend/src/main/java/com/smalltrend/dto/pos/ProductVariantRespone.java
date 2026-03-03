package com.smalltrend.dto.pos;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ProductVariantRespone {
    private Integer id;
    private String name;
    private String sku;
    private String barcode;
    private BigDecimal sellPrice;
    private BigDecimal costPrice;
    private Integer stockQuantity;
    private String categoryName;
    private String brandName;
    private Integer unitId;
    private String unitName;
    private java.math.BigDecimal unitValue;
    private String imageUrl;
    private Map<String, String> attributes;
    private Boolean isActive;
}