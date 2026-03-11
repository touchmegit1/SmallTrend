package com.smalltrend.controller.inventory.dashboard;

import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.service.inventory.dashboard.InventoryDashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryDashboardControllerTest {

    @Mock
    private InventoryDashboardService dashboardService;

    @Mock
    private JdbcTemplate jdbcTemplate;

    private InventoryDashboardController controller;

    @BeforeEach
    void setUp() {
        controller = new InventoryDashboardController(dashboardService, jdbcTemplate);
    }

    // ═══════════════════════════════════════════════════════════
    //  GET /api/inventory/dashboard/products
    // ═══════════════════════════════════════════════════════════

    @Test
    void getDashboardProducts_shouldReturnOk() {
        List<DashboardProductResponse> expected = List.of(
                DashboardProductResponse.builder()
                        .id(1)
                        .sku("SKU-001")
                        .name("Sản phẩm A")
                        .stockQuantity(100)
                        .minStock(50)
                        .purchasePrice(new BigDecimal("50000"))
                        .retailPrice(new BigDecimal("80000"))
                        .categoryId(1)
                        .categoryName("Thực phẩm")
                        .brandId(1)
                        .brandName("Brand A")
                        .build()
        );
        when(dashboardService.getAllProductsForDashboard()).thenReturn(expected);

        ResponseEntity<List<DashboardProductResponse>> response = controller.getDashboardProducts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(dashboardService).getAllProductsForDashboard();
    }

    @Test
    void getDashboardProducts_shouldReturnEmptyList_whenNoProducts() {
        when(dashboardService.getAllProductsForDashboard()).thenReturn(List.of());

        ResponseEntity<List<DashboardProductResponse>> response = controller.getDashboardProducts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().size());
    }

    // ═══════════════════════════════════════════════════════════
    //  GET /api/inventory/categories
    // ═══════════════════════════════════════════════════════════

    @Test
    void getAllCategories_shouldReturnOk() {
        List<CategoryResponse> expected = List.of(
                CategoryResponse.builder().id(1).name("Thực phẩm").build(),
                CategoryResponse.builder().id(2).name("Đồ uống").build()
        );
        when(dashboardService.getAllCategories()).thenReturn(expected);

        ResponseEntity<List<CategoryResponse>> response = controller.getAllCategories();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals(2, response.getBody().size());
        verify(dashboardService).getAllCategories();
    }

    // ═══════════════════════════════════════════════════════════
    //  GET /api/inventory/brands
    // ═══════════════════════════════════════════════════════════

    @Test
    void getAllBrands_shouldReturnOk() {
        List<BrandResponse> expected = List.of(
                BrandResponse.builder().id(1).name("Brand A").build(),
                BrandResponse.builder().id(2).name("Brand B").build()
        );
        when(dashboardService.getAllBrands()).thenReturn(expected);

        ResponseEntity<List<BrandResponse>> response = controller.getAllBrands();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals(2, response.getBody().size());
        verify(dashboardService).getAllBrands();
    }

    // ═══════════════════════════════════════════════════════════
    //  GET /api/inventory/dashboard/summary
    // ═══════════════════════════════════════════════════════════

    @Test
    void getDashboardSummary_shouldReturnOk() {
        DashboardSummaryResponse expected = DashboardSummaryResponse.builder()
                .totalProducts(10)
                .totalInventoryValue(new BigDecimal("5000000"))
                .lowStockCount(2)
                .expiredBatchCount(1)
                .expiringSoonCount(3)
                .needActionCount(3)
                .build();
        when(dashboardService.getDashboardSummary()).thenReturn(expected);

        ResponseEntity<DashboardSummaryResponse> response = controller.getDashboardSummary();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(dashboardService).getDashboardSummary();
    }

    // ═══════════════════════════════════════════════════════════
    //  GET /api/inventory/dashboard/batches
    // ═══════════════════════════════════════════════════════════

    @Test
    void getBatchStatuses_shouldReturnOk() {
        List<BatchStatusResponse> expected = List.of(
                BatchStatusResponse.builder()
                        .batchId(1)
                        .batchCode("BATCH-001")
                        .productName("Sản phẩm A")
                        .quantity(100)
                        .expiryDate(LocalDate.of(2026, 6, 30))
                        .status("SAFE")
                        .daysUntilExpiry(111)
                        .value(new BigDecimal("5000000"))
                        .locationName("Kho A1")
                        .build(),
                BatchStatusResponse.builder()
                        .batchId(2)
                        .batchCode("BATCH-002")
                        .productName("Sản phẩm B")
                        .quantity(50)
                        .expiryDate(LocalDate.of(2026, 3, 15))
                        .status("EXPIRING_SOON")
                        .daysUntilExpiry(4)
                        .value(new BigDecimal("2500000"))
                        .locationName("Kho B1")
                        .build()
        );
        when(dashboardService.getBatchStatuses()).thenReturn(expected);

        ResponseEntity<List<BatchStatusResponse>> response = controller.getBatchStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals(2, response.getBody().size());
        verify(dashboardService).getBatchStatuses();
    }

    // ═══════════════════════════════════════════════════════════
    //  GET /api/inventory/product-batches
    // ═══════════════════════════════════════════════════════════

    @Test
    void getProductBatches_shouldReturnOk() {
        List<ProductBatchResponse> expected = List.of(
                ProductBatchResponse.builder()
                        .id(1)
                        .batchCode("BATCH-001")
                        .productId(1)
                        .productName("Sản phẩm A")
                        .quantity(100)
                        .expiryDate(LocalDate.of(2026, 6, 30))
                        .receivedDate(LocalDate.of(2026, 1, 15))
                        .costPrice(new BigDecimal("50000"))
                        .build()
        );
        when(dashboardService.getProductBatches()).thenReturn(expected);

        ResponseEntity<List<ProductBatchResponse>> response = controller.getProductBatches();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(dashboardService).getProductBatches();
    }

    // ═══════════════════════════════════════════════════════════
    //  GET /api/inventory/dashboard/recent-activities
    // ═══════════════════════════════════════════════════════════

    @Test
    void getRecentActivities_shouldReturnOk() {
        List<RecentActivityResponse> expected = List.of(
                RecentActivityResponse.builder()
                        .type("IN")
                        .productName("PO PO-2026-001")
                        .quantity(200)
                        .referenceType("PurchaseOrder")
                        .referenceCode("PO-2026-001")
                        .createdAt(LocalDateTime.of(2026, 3, 10, 14, 30))
                        .build()
        );
        when(dashboardService.getRecentActivities()).thenReturn(expected);

        ResponseEntity<List<RecentActivityResponse>> response = controller.getRecentActivities();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(dashboardService).getRecentActivities();
    }

    @Test
    void getRecentActivities_shouldReturnEmptyList_whenNoActivities() {
        when(dashboardService.getRecentActivities()).thenReturn(List.of());

        ResponseEntity<List<RecentActivityResponse>> response = controller.getRecentActivities();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().size());
    }

    // ═══════════════════════════════════════════════════════════
    //  POST /api/inventory/debug/reseed-stock
    // ═══════════════════════════════════════════════════════════

    @Test
    void reseedStock_shouldReturnAlreadyExists_whenCountGreaterThanZero() {
        when(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM inventory_stock WHERE quantity > 0", Integer.class))
                .thenReturn(5);

        ResponseEntity<?> response = controller.reseedStock();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Stock data already exists", ((java.util.Map<?, ?>) response.getBody()).get("message"));
        assertEquals(5, ((java.util.Map<?, ?>) response.getBody()).get("count"));
    }

    @Test
    void reseedStock_shouldReseed_whenCountIsNull_orZero() {
        when(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM inventory_stock WHERE quantity > 0", Integer.class))
                .thenReturn(0).thenReturn(5);

        ResponseEntity<?> response = controller.reseedStock();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Stock data reseeded successfully", ((java.util.Map<?, ?>) response.getBody()).get("message"));
        assertEquals(5, ((java.util.Map<?, ?>) response.getBody()).get("count"));
        verify(jdbcTemplate).execute("DELETE FROM inventory_stock");
    }

    @Test
    void reseedStock_shouldReseed_whenCountIsNull() {
        when(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM inventory_stock WHERE quantity > 0", Integer.class))
                .thenReturn(null).thenReturn(5);

        ResponseEntity<?> response = controller.reseedStock();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Stock data reseeded successfully", ((java.util.Map<?, ?>) response.getBody()).get("message"));
        assertEquals(5, ((java.util.Map<?, ?>) response.getBody()).get("count"));
        verify(jdbcTemplate).execute("DELETE FROM inventory_stock");
    }

    @Test
    void reseedStock_shouldReturnInternalServerError_whenExceptionThrown() {
        when(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM inventory_stock WHERE quantity > 0", Integer.class))
                .thenThrow(new RuntimeException("DB Error"));

        ResponseEntity<?> response = controller.reseedStock();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("DB Error", ((java.util.Map<?, ?>) response.getBody()).get("error"));
    }
}
