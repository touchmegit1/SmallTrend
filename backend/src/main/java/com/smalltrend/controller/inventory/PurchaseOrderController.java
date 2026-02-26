package com.smalltrend.controller.inventory;

import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.inventorycount.*;
import com.smalltrend.dto.inventory.location.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.service.inventory.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    // ─── Purchase Orders ─────────────────────────────────────

    /**
     * GET /api/inventory/purchase-orders
     * List all purchase orders (newest first)
     */
    @GetMapping("/purchase-orders")
    public ResponseEntity<List<PurchaseOrderResponse>> getAllOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllOrders());
    }

    /**
     * GET /api/inventory/purchase-orders/{id}
     * Get a single purchase order detail
     */
    @GetMapping("/purchase-orders/{id}")
    public ResponseEntity<PurchaseOrderResponse> getOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseOrderService.getOrderById(id));
    }

    /**
     * GET /api/inventory/purchase-orders/next-code
     * Generate the next PO code (e.g. NH004)
     */
    @GetMapping("/purchase-orders/next-code")
    public ResponseEntity<Map<String, String>> getNextCode() {
        String code = purchaseOrderService.generateNextPOCode();
        return ResponseEntity.ok(Map.of("code", code));
    }

    /**
     * POST /api/inventory/purchase-orders/draft
     * Save a new purchase order as DRAFT
     */
    @PostMapping("/purchase-orders/draft")
    public ResponseEntity<PurchaseOrderResponse> saveDraft(@RequestBody PurchaseOrderRequest request) {
        PurchaseOrderResponse response = purchaseOrderService.saveDraft(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/inventory/purchase-orders/confirm
     * Create and confirm a new purchase order (updates stock)
     */
    @PostMapping("/purchase-orders/confirm")
    public ResponseEntity<PurchaseOrderResponse> confirmOrder(@RequestBody PurchaseOrderRequest request) {
        PurchaseOrderResponse response = purchaseOrderService.confirmOrder(request);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/inventory/purchase-orders/{id}/confirm
     * Confirm an existing DRAFT purchase order
     */
    @PutMapping("/purchase-orders/{id}/confirm")
    public ResponseEntity<PurchaseOrderResponse> confirmExistingOrder(@PathVariable Integer id) {
        PurchaseOrderResponse response = purchaseOrderService.confirmExistingOrder(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/inventory/purchase-orders/{id}/cancel
     * Cancel a DRAFT purchase order
     */
    @PutMapping("/purchase-orders/{id}/cancel")
    public ResponseEntity<PurchaseOrderResponse> cancelOrder(@PathVariable Integer id) {
        PurchaseOrderResponse response = purchaseOrderService.cancelOrder(id);
        return ResponseEntity.ok(response);
    }

    // ─── Reference Data ──────────────────────────────────────

    /**
     * GET /api/inventory/suppliers
     * List all suppliers
     */
    @GetMapping("/suppliers")
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        return ResponseEntity.ok(purchaseOrderService.getAllSuppliers());
    }

    /**
     * GET /api/inventory/products
     * List all products (for search)
     */
    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(purchaseOrderService.getAllProducts());
    }
}

