package com.smalltrend.controller.products;

import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.TaxRateRepository;
import com.smalltrend.validation.product.TaxRateValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaxRateControllerTest {

    @Mock
    private TaxRateRepository taxRateRepository;

    @Mock
    private TaxRateValidator taxRateValidator;

    private TaxRateController taxRateController;

    @BeforeEach
    void setup() {
        taxRateController = new TaxRateController(taxRateRepository, taxRateValidator);
    }

    @Test
    void getAll_shouldReturnTaxRateList() {
        TaxRate taxRate = buildTaxRate(1, "VAT 10%", BigDecimal.valueOf(10), true);
        List<TaxRate> taxRates = List.of(taxRate);

        when(taxRateRepository.findAll()).thenReturn(taxRates);

        ResponseEntity<List<TaxRate>> response = taxRateController.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(taxRates, response.getBody());
        verify(taxRateRepository).findAll();
    }

    @Test
    void create_shouldReturnCreatedTaxRate() {
        TaxRate request = buildTaxRate(null, "VAT 8%", BigDecimal.valueOf(8), true);
        TaxRate saved = buildTaxRate(1, "VAT 8%", BigDecimal.valueOf(8), true);

        when(taxRateRepository.save(request)).thenReturn(saved);

        ResponseEntity<TaxRate> response = taxRateController.create(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(saved, response.getBody());
        verify(taxRateRepository).save(request);
    }

    @Test
    void update_shouldReturnUpdatedTaxRate_whenFound() {
        TaxRate existing = buildTaxRate(1, "VAT 10%", BigDecimal.valueOf(10), true);
        TaxRate updateData = buildTaxRate(null, "VAT 8%", BigDecimal.valueOf(8), false);
        TaxRate savedUpdated = buildTaxRate(1, "VAT 8%", BigDecimal.valueOf(8), false);

        when(taxRateValidator.requireExistingTaxRate(1)).thenReturn(existing);
        when(taxRateRepository.save(existing)).thenReturn(savedUpdated);

        ResponseEntity<TaxRate> response = taxRateController.update(1, updateData);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(savedUpdated, response.getBody());
        verify(taxRateValidator).requireExistingTaxRate(1);
        verify(taxRateRepository).save(existing);
        assertEquals("VAT 8%", existing.getName());
        assertEquals(BigDecimal.valueOf(8), existing.getRate());
        assertEquals(false, existing.isActive());
    }

    @Test
    void update_shouldThrow_whenNotFound() {
        TaxRate updateData = buildTaxRate(null, "VAT 8%", BigDecimal.valueOf(8), false);

        when(taxRateValidator.requireExistingTaxRate(99)).thenThrow(new RuntimeException("Không tìm thấy thuế"));

        assertThrows(RuntimeException.class, () -> taxRateController.update(99, updateData));

        verify(taxRateValidator).requireExistingTaxRate(99);
        verify(taxRateRepository, never()).save(any());
    }

    @Test
    void delete_shouldDeleteAndReturnOk_whenExists() {
        when(taxRateValidator.requireExistingTaxRate(1)).thenReturn(buildTaxRate(1, "VAT 10%", BigDecimal.valueOf(10), true));

        ResponseEntity<Void> response = taxRateController.delete(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(taxRateValidator).requireExistingTaxRate(1);
        verify(taxRateRepository).deleteById(1);
    }

    @Test
    void delete_shouldThrow_whenNotFound() {
        when(taxRateValidator.requireExistingTaxRate(99)).thenThrow(new RuntimeException("Không tìm thấy thuế"));

        assertThrows(RuntimeException.class, () -> taxRateController.delete(99));

        verify(taxRateValidator).requireExistingTaxRate(99);
        verify(taxRateRepository, never()).deleteById(any());
    }

    private TaxRate buildTaxRate(Integer id, String name, BigDecimal rate, boolean active) {
        TaxRate taxRate = new TaxRate();
        taxRate.setId(id);
        taxRate.setName(name);
        taxRate.setRate(rate);
        taxRate.setActive(active);
        return taxRate;
    }
}
