package com.smalltrend.controller.inventory;

import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.service.inventory.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<PurchaseOrderResponse> getOrderById(@PathVariable("id") Integer id) {
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
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> confirmOrder(@RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(purchaseOrderService.confirmOrder(request));
    }

    @PutMapping("/purchase-orders/{id}/confirm")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> confirmExistingOrder(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(purchaseOrderService.confirmExistingOrder(id));
    }

    @PutMapping("/purchase-orders/{id}")
    public ResponseEntity<PurchaseOrderResponse> updateOrder(@PathVariable("id") Integer id, @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(purchaseOrderService.updateOrder(id, request));
    }

    @PutMapping("/purchase-orders/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> rejectOrder(@PathVariable("id") Integer id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(purchaseOrderService.rejectOrder(id, payload.get("rejectionReason")));
    }

    @PutMapping("/purchase-orders/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> approveOrder(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(purchaseOrderService.approveOrder(id));
    }

    // ─── New: NV kho kiểm kê ─────────────────────────────────

    @PutMapping("/purchase-orders/{id}/start-checking")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'INVENTORY_STAFF', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF')")
    public ResponseEntity<PurchaseOrderResponse> startChecking(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(purchaseOrderService.startChecking(id));
    }

    @PutMapping("/purchase-orders/{id}/receive")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'INVENTORY_STAFF', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF')")
    public ResponseEntity<PurchaseOrderResponse> receiveGoods(@PathVariable("id") Integer id, @RequestBody GoodsReceiptRequest request) {
        return ResponseEntity.ok(purchaseOrderService.receiveGoods(id, request));
    }

    @PutMapping("/purchase-orders/{id}/shortage/close")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> closeShortage(@PathVariable("id") Integer id, @RequestBody(required = false) Map<String, String> payload) {
        String note = payload != null ? payload.get("managerDecisionNote") : null;
        return ResponseEntity.ok(purchaseOrderService.closeShortage(id, note));
    }

    @PutMapping("/purchase-orders/{id}/shortage/request-supplement")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> requestSupplierSupplement(@PathVariable("id") Integer id, @RequestBody(required = false) Map<String, String> payload) {
        String note = payload != null ? payload.get("managerDecisionNote") : null;
        return ResponseEntity.ok(purchaseOrderService.requestSupplierSupplement(id, note));
    }

    // ─── Cancel & Delete ─────────────────────────────────────

    @PutMapping("/purchase-orders/{id}/cancel")
    public ResponseEntity<PurchaseOrderResponse> cancelOrder(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(purchaseOrderService.cancelOrder(id));
    }

    @DeleteMapping("/purchase-orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable("id") Integer id) {
        purchaseOrderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Reference Data ──────────────────────────────────────

    @GetMapping("/suppliers")
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        return ResponseEntity.ok(purchaseOrderService.getAllSuppliers());
    }

    @GetMapping("/suppliers/{supplierId}/contracts")
    public ResponseEntity<List<ContractResponse>> getContractsBySupplier(@PathVariable Integer supplierId) {
        return ResponseEntity.ok(purchaseOrderService.getContractsBySupplier(supplierId));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(purchaseOrderService.getAllProducts());
    }
}
