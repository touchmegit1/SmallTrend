package com.smalltrend.dto.products;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    private String name;
    private String description;
    private String imageUrl;
    private Integer categoryId;
    private Integer brandId;
    private Integer taxRateId;
    private Boolean isActive;
}
