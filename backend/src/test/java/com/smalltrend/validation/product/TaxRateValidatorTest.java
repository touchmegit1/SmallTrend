package com.smalltrend.validation.product;

import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.TaxRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaxRateValidatorTest {

    @Mock
    private TaxRateRepository taxRateRepository;

    private TaxRateValidator taxRateValidator;

    @BeforeEach
    void setup() {
        taxRateValidator = new TaxRateValidator(taxRateRepository);
    }

    @Test
    void requireExistingTaxRate_shouldReturnTaxRate_whenFound() {
        TaxRate taxRate = new TaxRate();
        taxRate.setId(1);
        taxRate.setName("VAT 10%");
        taxRate.setRate(BigDecimal.valueOf(10));
        taxRate.setActive(true);

        when(taxRateRepository.findById(1)).thenReturn(Optional.of(taxRate));

        TaxRate result = taxRateValidator.requireExistingTaxRate(1);

        assertEquals(1, result.getId());
        assertEquals("VAT 10%", result.getName());
        verify(taxRateRepository).findById(1);
    }

    @Test
    void requireExistingTaxRate_shouldThrowRuntimeException_whenNotFound() {
        when(taxRateRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> taxRateValidator.requireExistingTaxRate(99));

        assertEquals("Không tìm thấy thuế", exception.getMessage());
        verify(taxRateRepository).findById(99);
    }
}
