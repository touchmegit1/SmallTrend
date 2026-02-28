package com.smalltrend.dto.products;

import lombok.Data;

@Data
public class CreateProductComboItemRequest {
    private Integer productVariantId;
    private Integer quantity; // Số lượng trong combo

    // Optional settings from entity
    private Integer minQuantity;
    private Integer maxQuantity;
    private Boolean isOptional;
    private Boolean canSubstitute;
    private Integer displayOrder;
    private String notes;
}
