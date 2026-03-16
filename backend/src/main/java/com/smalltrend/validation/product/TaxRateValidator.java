package com.smalltrend.validation.product;

import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.TaxRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TaxRateValidator {

    private final TaxRateRepository taxRateRepository;

    public TaxRate requireExistingTaxRate(Integer id) {
        return taxRateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thuế"));
    }
}
