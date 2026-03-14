package com.smalltrend.dto.products;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO nhận dữ liệu payload từ Frontend gửi lên API (Dùng chung cho cả thao tác
 * Tạo mới và Cập nhật danh mục)
 */
@Getter
@Setter
public class CategoriesRequest {


    private String code;


    private String name;


    private String description;
}