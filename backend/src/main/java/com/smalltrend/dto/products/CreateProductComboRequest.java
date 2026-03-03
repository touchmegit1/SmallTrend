package com.smalltrend.dto.products;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateProductComboRequest {
    private String comboCode;
    private String comboName;
    private String description;
    private String imageUrl;

    private BigDecimal comboPrice;

    private LocalDate validFrom;
    private LocalDate validTo;
    private Boolean isActive;

    // Optional settings based on entity
    private Integer maxQuantityPerOrder;
    private Integer stockLimit;
    private String comboType;
    private Boolean isFeatured;
    private Integer displayOrder;
    private String tags;
    private String status;

    private List<CreateProductComboItemRequest> items;
}
