package com.smalltrend.validation.product;

import com.smalltrend.entity.Brand;
import com.smalltrend.repository.BrandRepository;
import com.smalltrend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BrandValidator {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    public Brand requireExistingBrand(Integer id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));
    }

    public void validateDeletable(Integer id) {
        if (productRepository.existsByBrandId(id)) {
            throw new RuntimeException("Không thể xoá thương hiệu vì đang có sản phẩm thuộc thương hiệu này");
        }
    }

    public void validateNameUniqueForCreate(String name) {
        if (name != null && !name.trim().isEmpty() && brandRepository.existsByName(name)) {
            throw new RuntimeException("Tên thương hiệu đã tồn tại");
        }
    }

    public void validateNameUniqueForUpdate(String name, Integer currentId) {
        if (name != null && !name.trim().isEmpty() && brandRepository.existsByNameAndIdNot(name, currentId)) {
            throw new RuntimeException("Tên thương hiệu đã tồn tại");
        }
    }
}
