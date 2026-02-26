package com.smalltrend.controller.inventory;

import com.smalltrend.dto.inventory.purchaseorder.*;
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

    @GetMapping("/purchase-orders")
    public ResponseEntity<List<PurchaseOrderResponse>> getAllOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllOrders());
    }

    @GetMapping("/purchase-orders/{id}")
    public ResponseEntity<PurchaseOrderResponse> getOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseOrderService.getOrderById(id));
    }

    @GetMapping("/purchase-orders/next-code")
    public ResponseEntity<Map<String, String>> getNextCode() {
        String code = purchaseOrderService.generateNextPOCode();
        return ResponseEntity.ok(Map.of("code", code));
    }

    @PostMapping("/purchase-orders/draft")
    public ResponseEntity<PurchaseOrderResponse> saveDraft(@RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(purchaseOrderService.saveDraft(request));
    }

    @PostMapping("/purchase-orders/confirm")
    public ResponseEntity<PurchaseOrderResponse> confirmOrder(@RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(purchaseOrderService.confirmOrder(request));
    }

    @PutMapping("/purchase-orders/{id}/confirm")
    public ResponseEntity<PurchaseOrderResponse> confirmExistingOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseOrderService.confirmExistingOrder(id));
    }

    @PutMapping("/purchase-orders/{id}/cancel")
    public ResponseEntity<PurchaseOrderResponse> cancelOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseOrderService.cancelOrder(id));
    }

    // ─── Reference Data ──────────────────────────────────────

    @GetMapping("/suppliers")
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        return ResponseEntity.ok(purchaseOrderService.getAllSuppliers());
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(purchaseOrderService.getAllProducts());
    }
}
