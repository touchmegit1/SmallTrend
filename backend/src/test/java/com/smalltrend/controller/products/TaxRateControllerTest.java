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
        // Arrange: Cài đặt dữ liệu mock
        TaxRate taxRate = new TaxRate(1, "VAT 10%", BigDecimal.valueOf(10), true);
        List<TaxRate> taxRates = List.of(taxRate);

        when(taxRateRepository.findAll()).thenReturn(taxRates);

        // Act: Gọi API
        ResponseEntity<List<TaxRate>> response = taxRateController.getAll();

        // Assert: Kiểm tra phản hồi
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(taxRates, response.getBody());
        verify(taxRateRepository).findAll();
    }

    @Test
    void create_shouldReturnCreatedTaxRate() {
        // Arrange: Cài đặt dữ liệu mock cho tạo mới
        TaxRate request = new TaxRate(null, "VAT 8%", BigDecimal.valueOf(8), true);
        TaxRate saved = new TaxRate(1, "VAT 8%", BigDecimal.valueOf(8), true);

        when(taxRateRepository.save(request)).thenReturn(saved);

        // Act: Gọi API
        ResponseEntity<TaxRate> response = taxRateController.create(request);

        // Assert: Kiểm tra phản hồi
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(saved, response.getBody());
        verify(taxRateRepository).save(request);
    }

    @Test
    void update_shouldReturnUpdatedTaxRate_whenFound() {
        // Arrange: Cài đặt mock dữ liệu cũ và dữ liệu lưu mới
        TaxRate existing = new TaxRate(1, "VAT 10%", BigDecimal.valueOf(10), true);
        TaxRate updateData = new TaxRate(null, "VAT 8%", BigDecimal.valueOf(8), false);
        TaxRate savedUpdated = new TaxRate(1, "VAT 8%", BigDecimal.valueOf(8), false);

        when(taxRateRepository.findById(1)).thenReturn(Optional.of(existing));
        when(taxRateRepository.save(any(TaxRate.class))).thenReturn(savedUpdated);

        // Act: Gọi API update
        ResponseEntity<TaxRate> response = taxRateController.update(1, updateData);

        // Assert: Đảm bảo mapping dữ liệu chính xác và được lưu
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
        // Arrange: Mock trả về empty
        TaxRate updateData = new TaxRate(null, "VAT 8%", BigDecimal.valueOf(8), false);

        when(taxRateRepository.findById(99)).thenReturn(Optional.empty());

        // Act: Gọi API update với ID không tồn tại
        ResponseEntity<TaxRate> response = taxRateController.update(99, updateData);

        // Assert: HTTP Status 404
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(taxRateRepository).findById(99);
        verify(taxRateRepository, never()).save(any());
    }

    @Test
    void delete_shouldDeleteAndReturnOk_whenExists() {
        // Arrange: Mock ID tồn tại
        when(taxRateRepository.existsById(1)).thenReturn(true);

        // Act: Gọi API xóa
        ResponseEntity<Void> response = taxRateController.delete(1);

        // Assert: Xác minh ID được xóa
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(taxRateRepository).existsById(1);
        verify(taxRateRepository).deleteById(1);
    }

    @Test
    void delete_shouldReturnNotFound_whenDoesNotExist() {
        // Arrange: Mock ID không tồn tại
        when(taxRateRepository.existsById(99)).thenReturn(false);

        // Act: Gọi API xóa ID sai
        ResponseEntity<Void> response = taxRateController.delete(99);

        // Assert: HTTP Status 404
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(taxRateRepository).existsById(99);
        verify(taxRateRepository, never()).deleteById(any());
    }
}
