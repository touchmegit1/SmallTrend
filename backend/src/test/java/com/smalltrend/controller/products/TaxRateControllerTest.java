package com.smalltrend.controller.products;

import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.TaxRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaxRateControllerTest {

    @Mock
    private TaxRateRepository taxRateRepository;

    private TaxRateController taxRateController;

    @BeforeEach
    void setup() {
        taxRateController = new TaxRateController(taxRateRepository);
    }

    @Test
    void getAll_shouldReturnTaxRateList() {
        TaxRate taxRate = new TaxRate(1, "VAT 10%", BigDecimal.valueOf(10), true);
        List<TaxRate> taxRates = List.of(taxRate);

        when(taxRateRepository.findAll()).thenReturn(taxRates);

        ResponseEntity<List<TaxRate>> response = taxRateController.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(taxRates, response.getBody());
        verify(taxRateRepository).findAll();
    }

    @Test
    void create_shouldReturnCreatedTaxRate() {
        TaxRate request = new TaxRate(null, "VAT 8%", BigDecimal.valueOf(8), true);
        TaxRate saved = new TaxRate(1, "VAT 8%", BigDecimal.valueOf(8), true);

        when(taxRateRepository.save(request)).thenReturn(saved);

        ResponseEntity<TaxRate> response = taxRateController.create(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(saved, response.getBody());
        verify(taxRateRepository).save(request);
    }

    @Test
    void update_shouldReturnUpdatedTaxRate_whenFound() {
        TaxRate existing = new TaxRate(1, "VAT 10%", BigDecimal.valueOf(10), true);
        TaxRate updateData = new TaxRate(null, "VAT 8%", BigDecimal.valueOf(8), false);
        TaxRate savedUpdated = new TaxRate(1, "VAT 8%", BigDecimal.valueOf(8), false);

        when(taxRateRepository.findById(1)).thenReturn(Optional.of(existing));
        when(taxRateRepository.save(any(TaxRate.class))).thenReturn(savedUpdated);

        ResponseEntity<TaxRate> response = taxRateController.update(1, updateData);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(savedUpdated, response.getBody());
        verify(taxRateRepository).findById(1);
        verify(taxRateRepository).save(existing);
        
        // Ensure values were mapped onto existing entity before saving
        assertEquals("VAT 8%", existing.getName());
        assertEquals(BigDecimal.valueOf(8), existing.getRate());
        assertEquals(false, existing.isActive());
    }

    @Test
    void update_shouldReturnNotFound_whenNotFound() {
        TaxRate updateData = new TaxRate(null, "VAT 8%", BigDecimal.valueOf(8), false);

        when(taxRateRepository.findById(99)).thenReturn(Optional.empty());

        ResponseEntity<TaxRate> response = taxRateController.update(99, updateData);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(taxRateRepository).findById(99);
        verify(taxRateRepository, never()).save(any());
    }

    @Test
    void delete_shouldDeleteAndReturnOk_whenExists() {
        when(taxRateRepository.existsById(1)).thenReturn(true);

        ResponseEntity<Void> response = taxRateController.delete(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(taxRateRepository).existsById(1);
        verify(taxRateRepository).deleteById(1);
    }

    @Test
    void delete_shouldReturnNotFound_whenDoesNotExist() {
        when(taxRateRepository.existsById(99)).thenReturn(false);

        ResponseEntity<Void> response = taxRateController.delete(99);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(taxRateRepository).existsById(99);
        verify(taxRateRepository, never()).deleteById(any());
    }
}
