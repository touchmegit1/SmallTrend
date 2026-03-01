package com.smalltrend.dto.products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductComboItemResponse {
    private Integer id;
    private Integer comboId;

    // Product Variant Info
    private Integer productVariantId;
    private String productVariantName;
    private String sku;
    private String barcode;
    private BigDecimal sellPrice;
    private String imageUrl;

    private Integer quantity;
    private Integer minQuantity;
    private Integer maxQuantity;
    private Boolean isOptional;
    private Boolean canSubstitute;
    private Integer displayOrder;
    private String notes;
}
