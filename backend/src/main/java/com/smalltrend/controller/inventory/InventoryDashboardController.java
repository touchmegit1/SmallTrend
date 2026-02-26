package com.smalltrend.controller.inventory;

import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.inventorycount.*;
import com.smalltrend.dto.inventory.location.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.service.inventory.InventoryDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class InventoryDashboardController {

    private final InventoryDashboardService dashboardService;

    /**
     * GET /api/inventory/dashboard/products
     * Full product list with aggregated stock, pricing, category, brand info.
     * Shape matches what the frontend Dashboard expects (flat, with stock_quantity, purchase_price, etc.)
     */
    @GetMapping("/dashboard/products")
    public ResponseEntity<List<DashboardProductResponse>> getDashboardProducts() {
        return ResponseEntity.ok(dashboardService.getAllProductsForDashboard());
    }

    /**
     * GET /api/inventory/categories
     * List all categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(dashboardService.getAllCategories());
    }

    /**
     * GET /api/inventory/brands
     * List all brands
     */
    @GetMapping("/brands")
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        return ResponseEntity.ok(dashboardService.getAllBrands());
    }

    /**
     * GET /api/inventory/product-batches
     * List all product batches with quantity and expiry info
     */
    @GetMapping("/product-batches")
    public ResponseEntity<List<ProductBatchResponse>> getAllProductBatches() {
        return ResponseEntity.ok(dashboardService.getAllProductBatches());
    }

    /**
     * GET /api/inventory/stock-movements
     * List all stock movements
     */
    @GetMapping("/stock-movements")
    public ResponseEntity<List<StockMovementResponse>> getAllStockMovements() {
        return ResponseEntity.ok(dashboardService.getAllStockMovements());
    }
}

