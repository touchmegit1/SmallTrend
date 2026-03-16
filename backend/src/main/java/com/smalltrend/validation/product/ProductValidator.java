package com.smalltrend.validation.product;

import com.smalltrend.entity.Brand;
import com.smalltrend.entity.Category;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.BrandRepository;
import com.smalltrend.repository.CategoryRepository;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.repository.TaxRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ProductValidator {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final TaxRateRepository taxRateRepository;

    public Product requireExistingProduct(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
    }

    public Category resolveCategory(Integer categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với id: " + categoryId));
    }

    public Brand resolveBrand(Integer brandId) {
        if (brandId == null) {
            return null;
        }
        return brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu với id: " + brandId));
    }

    public TaxRate resolveTaxRate(Integer taxRateId) {
        if (taxRateId == null) {
            return null;
        }
        return taxRateRepository.findById(taxRateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thuế suất với id: " + taxRateId));
    }

    public void validateDeletableWithinTwoMinutes(Product product) {
        LocalDateTime createdAt = product.getCreatedAt();
        if (createdAt == null) {
            return;
        }

        long minutes = Duration.between(createdAt, LocalDateTime.now()).toMinutes();
        if (minutes >= 2) {
            throw new RuntimeException("Sản phẩm đã tạo quá 2 phút, bạn không thể xoá sản phẩm này nữa!");
        }
    }
}
