package com.smalltrend.mapper;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.entity.Category;
import org.springframework.stereotype.Component;

/**
 * Lớp Mapper phụ trách chuyển đổi qua lại giữa Entity (Category) và DTO
 * (CategoriesRequest, CategoriesResponse)
 */
@Component
public class CategoryMapper {

    /**
     * Chuyển đổi dữ liệu từ Request DTO sang Entity để lưu vào database
     */
    public Category toEntity(CategoriesRequest request) {
        return Category.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    /**
     * Chuyển đổi dữ liệu từ Entity (lấy từ database) sang Response DTO để trả về
     * Frontend
     */
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