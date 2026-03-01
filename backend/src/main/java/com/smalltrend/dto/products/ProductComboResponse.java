package com.smalltrend.dto.products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductComboResponse {
    private Integer id;
    private String comboCode;
    private String comboName;
    private String description;
    private String imageUrl;
    private BigDecimal originalPrice;
    private BigDecimal comboPrice;
    private BigDecimal savedAmount;
    private BigDecimal discountPercent;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Boolean isActive;
    private Integer maxQuantityPerOrder;
    private Integer totalSold;
    private Integer stockLimit;
    private String comboType;
    private Boolean isFeatured;
    private Integer displayOrder;
    private String tags;
    private String status;
    private Integer createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<ProductComboItemResponse> items;
}
