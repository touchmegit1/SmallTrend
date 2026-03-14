package com.smalltrend.controller.inventory;

import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.service.inventory.InventoryDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class InventoryDashboardController {

    private final InventoryDashboardService dashboardService;
    private final JdbcTemplate jdbcTemplate;

    /**
     * GET /api/inventory/dashboard/products
     */
    @GetMapping("/dashboard/products")
    public ResponseEntity<List<DashboardProductResponse>> getDashboardProducts() {
        return ResponseEntity.ok(dashboardService.getAllProductsForDashboard());
    }

    /**
     * GET /api/inventory/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(dashboardService.getAllCategories());
    }

    /**
     * GET /api/inventory/brands
     */
    @GetMapping("/brands")
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        return ResponseEntity.ok(dashboardService.getAllBrands());
    }

    /**
     * GET /api/inventory/dashboard/summary
     */
    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    /**
     * GET /api/inventory/dashboard/batches
     */
    @GetMapping("/dashboard/batches")
    public ResponseEntity<List<BatchStatusResponse>> getBatchStatuses() {
        return ResponseEntity.ok(dashboardService.getBatchStatuses());
    }

    /**
     * GET /api/inventory/product-batches
     */
    @GetMapping("/product-batches")
    public ResponseEntity<List<ProductBatchResponse>> getProductBatches() {
        return ResponseEntity.ok(dashboardService.getProductBatches());
    }

    /**
     * GET /api/inventory/dashboard/recent-activities
     */
    @GetMapping("/dashboard/recent-activities")
    public ResponseEntity<List<RecentActivityResponse>> getRecentActivities() {
        return ResponseEntity.ok(dashboardService.getRecentActivities());
    }

    /**
     * POST /api/inventory/debug/reseed-stock
     * One-time fix: re-insert inventory_stock data using correct column mapping
     */
    @PostMapping("/debug/reseed-stock")
    public ResponseEntity<?> reseedStock() {
        try {
            // Check if data already exists
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM inventory_stock WHERE quantity > 0", Integer.class);
            
            if (count != null && count > 0) {
                return ResponseEntity.ok(Map.of(
                    "message", "Stock data already exists",
                    "count", count
                ));
            }
            
            // Delete old potentially broken rows
            jdbcTemplate.execute("DELETE FROM inventory_stock");
            
            // Re-insert with correct column: location_id
            jdbcTemplate.execute(
                "INSERT INTO inventory_stock (variant_id, batch_id, location_id, quantity) VALUES " +
                "(1, 1, 1, 250), " +
                "(2, 2, 1, 180), " +
                "(3, 3, 2, 800), " +
                "(4, 4, 3, 350), " +
                "(5, 5, 4, 220)"
            );
            
            Integer newCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM inventory_stock WHERE quantity > 0", Integer.class);
            
            return ResponseEntity.ok(Map.of(
                "message", "Stock data reseeded successfully",
                "count", newCount
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}
