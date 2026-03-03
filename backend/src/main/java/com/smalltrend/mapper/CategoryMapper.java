package com.smalltrend.mapper;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoriesRequest request) {
        return Category.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    public CategoriesResponse toResponse(Category category) {
        return CategoriesResponse.builder()
                .id(category.getId())
                .code(category.getCode())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}