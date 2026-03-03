package com.smalltrend.dto.products;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateVariantRequest {
    private String sku;
    private String barcode;
    private Integer unitId;
    private BigDecimal unitValue;
    private BigDecimal sellPrice;
    private String imageUrl;
    private Boolean isActive;
}
