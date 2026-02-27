package com.smalltrend.dto.products;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoriesRequest {
    private String code;
    private String name;
    private String description;
}