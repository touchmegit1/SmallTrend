package com.smalltrend.validation.product;

import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.TaxRateRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class TaxRateValidator {

    private final TaxRateRepository taxRateRepository;

    public TaxRateValidator(TaxRateRepository taxRateRepository) {
        this.taxRateRepository = taxRateRepository;
    }

    public TaxRate requireExistingTaxRate(Integer id) {
        return taxRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thuế"));
    }

    public String validateAndNormalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Vui lòng điền tên loại thuế");
        }
        return name.trim();
    }

    public BigDecimal validateRate(BigDecimal rate) {
        if (rate == null) {
            throw new RuntimeException("Vui lòng nhập mức tỷ lệ thuế");
        }
        if (rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Mức tỷ lệ thuế phải nằm trong khoảng từ 0 đến 100");
        }
        return rate;
    }

    public void validateNameUniqueForCreate(String name) {
        if (taxRateRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Tên thuế suất đã tồn tại");
        }
    }

    public void validateNameUniqueForUpdate(String name, Integer currentId) {
        if (taxRateRepository.existsByNameIgnoreCaseAndIdNot(name, currentId)) {
            throw new RuntimeException("Tên thuế suất đã tồn tại");
        }
    }
}
