package com.smalltrend.validation.product;

import com.smalltrend.entity.ProductCombo;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.repository.ProductComboRepository;
import com.smalltrend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductComboValidator {

    private final ProductComboRepository productComboRepository;
    private final ProductVariantRepository productVariantRepository;

    public ProductCombo requireExistingCombo(Integer id) {
        return productComboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy combo với id: " + id));
    }

    public void validateComboCodeUniqueForCreate(String comboCode) {
        if (comboCode != null && !comboCode.trim().isEmpty()
                && productComboRepository.findByComboCode(comboCode).isPresent()) {
            throw new RuntimeException("Mã combo đã tồn tại: " + comboCode);
        }
    }

    public void validateComboCodeUniqueForUpdate(ProductCombo combo, String requestComboCode) {
        if (!combo.getComboCode().equals(requestComboCode)
                && productComboRepository.findByComboCode(requestComboCode).isPresent()) {
            throw new RuntimeException("Mã combo đã tồn tại: " + requestComboCode);
        }
    }

    public ProductVariant requireExistingVariant(Integer variantId) {
        return productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể với id: " + variantId));
    }
}
