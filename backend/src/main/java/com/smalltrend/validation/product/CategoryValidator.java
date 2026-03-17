package com.smalltrend.validation.product;

import com.smalltrend.entity.Category;
import com.smalltrend.repository.CategoryRepository;
import com.smalltrend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategoryValidator {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public Category requireExistingCategory(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
    }

    public void validateDeletable(Integer id) {
        if (productRepository.existsByCategoryId(id)) {
            throw new RuntimeException("Không thể xoá danh mục vì đang có sản phẩm thuộc danh mục này");
        }
    }

    public void validateCodeUniqueForCreate(String code) {
        if (code != null && !code.trim().isEmpty() && categoryRepository.existsByCode(code)) {
            throw new RuntimeException("Mã danh mục đã tồn tại");
        }
    }

    public void validateCodeUniqueForUpdate(String code, Integer currentId) {
        if (code != null && !code.trim().isEmpty() && categoryRepository.existsByCodeAndIdNot(code, currentId)) {
            throw new RuntimeException("Mã danh mục đã tồn tại");
        }
    }

    public void validateNameUniqueForCreate(String name) {
        if (name != null && !name.trim().isEmpty() && categoryRepository.existsByName(name)) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }
    }

    public void validateNameUniqueForUpdate(String name, Integer currentId) {
        if (name != null && !name.trim().isEmpty() && categoryRepository.existsByNameAndIdNot(name, currentId)) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }
    }
}
