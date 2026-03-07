package com.smalltrend.dto.pos;

import com.smalltrend.dto.products.UnitConversionResponse;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
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

    private String imageUrl;
    private Map<String, String> attributes;
    private Boolean isActive;
    private BigDecimal taxRate;
    private String taxName;
    private java.time.LocalDateTime createdAt;
    private List<UnitConversionResponse> unitConversions;
}