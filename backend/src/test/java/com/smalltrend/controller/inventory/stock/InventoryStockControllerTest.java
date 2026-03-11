package com.smalltrend.controller.inventory.stock;

import com.smalltrend.dto.inventory.StockAdjustRequest;
import com.smalltrend.dto.inventory.StockImportRequest;
import com.smalltrend.service.inventory.stock.InventoryStockService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryStockControllerTest {

    @Mock
    private InventoryStockService inventoryStockService;

    private InventoryStockController controller;

    @BeforeEach
    void setUp() {
        controller = new InventoryStockController(inventoryStockService);
    }

    // ═══════════════════════════════════════════════════════════
    //  GET /api/inventory/stock/variant/{variantId}/total
    // ═══════════════════════════════════════════════════════════

    @Test
    void getTotalStockForVariant_shouldReturnOk() {
        when(inventoryStockService.getTotalStockForVariant(1)).thenReturn(250);

        ResponseEntity<Integer> response = controller.getTotalStockForVariant(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(250, response.getBody());
        verify(inventoryStockService).getTotalStockForVariant(1);
    }

    @Test
    void getTotalStockForVariant_shouldReturnZero_whenNoStock() {
        when(inventoryStockService.getTotalStockForVariant(99)).thenReturn(0);

        ResponseEntity<Integer> response = controller.getTotalStockForVariant(99);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, response.getBody());
        verify(inventoryStockService).getTotalStockForVariant(99);
    }

    // ═══════════════════════════════════════════════════════════
    //  POST /api/inventory/stock/import
    // ═══════════════════════════════════════════════════════════

    @Test
    void importStock_shouldReturnOk() {
        StockImportRequest request = StockImportRequest.builder()
                .variantId(1)
                .unitId(1)
                .quantity(100)
                .batchId(1)
                .locationId(1)
                .notes("Nhập hàng tháng 3")
                .build();

        ResponseEntity<Void> response = controller.importStock(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNull(response.getBody());
        verify(inventoryStockService).importStock(request);
    }

    @Test
    void importStock_shouldDelegateToService_withAllFields() {
        StockImportRequest request = StockImportRequest.builder()
                .variantId(3)
                .unitId(2)
                .quantity(500)
                .batchId(5)
                .locationId(2)
                .notes("Nhập theo đơn PO-2026-005")
                .build();

        controller.importStock(request);

        verify(inventoryStockService).importStock(request);
    }

    // ═══════════════════════════════════════════════════════════
    //  POST /api/inventory/stock/adjust
    // ═══════════════════════════════════════════════════════════

    @Test
    void adjustStock_shouldReturnOk() {
        StockAdjustRequest request = StockAdjustRequest.builder()
                .variantId(1)
                .batchId(1)
                .locationId(1)
                .adjustQuantity(-5)
                .reason("Hư hỏng trong kho")
                .build();

        ResponseEntity<Void> response = controller.adjustStock(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNull(response.getBody());
        verify(inventoryStockService).adjustStock(request);
    }

    @Test
    void adjustStock_shouldDelegateToService_withPositiveAdjustment() {
        StockAdjustRequest request = StockAdjustRequest.builder()
                .variantId(2)
                .batchId(3)
                .locationId(1)
                .adjustQuantity(10)
                .reason("Tìm thấy hàng chưa nhập hệ thống")
                .build();

        controller.adjustStock(request);

        verify(inventoryStockService).adjustStock(request);
    }
}
