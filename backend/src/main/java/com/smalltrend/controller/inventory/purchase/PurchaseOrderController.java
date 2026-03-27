package com.smalltrend.controller.inventory.purchase;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.inventory.purchase.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.service.inventory.purchase.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
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
    public ResponseEntity<PurchaseOrderResponse> saveDraft(@Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(purchaseOrderService.saveDraft(request));
    }

    @PostMapping("/purchase-orders/confirm")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> confirmOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(purchaseOrderService.confirmOrder(request));
    }

    @PutMapping("/purchase-orders/{id}/confirm")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> confirmExistingOrder(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(purchaseOrderService.confirmExistingOrder(id));
    }

    @PutMapping("/purchase-orders/{id}")
    public ResponseEntity<PurchaseOrderResponse> updateOrder(@PathVariable("id") Integer id, @Valid @RequestBody PurchaseOrderRequest request) {
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
    public ResponseEntity<PurchaseOrderResponse> receiveGoods(@PathVariable("id") Integer id, @Valid @RequestBody GoodsReceiptRequest request) {
        return ResponseEntity.ok(purchaseOrderService.receiveGoods(id, request));
    }

    @PostMapping("/purchase-orders/{id}/notify-manager")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'INVENTORY_STAFF', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_INVENTORY_STAFF')")
    public ResponseEntity<MessageResponse> notifyManagers(@PathVariable Integer id,
            @Valid @RequestBody NotifyManagerEmailRequest request) {
        return ResponseEntity.ok(purchaseOrderService.notifyManagers(id, request));
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

    @PutMapping("/purchase-orders/{id}/shortage/reject")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> rejectShortage(@PathVariable("id") Integer id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(purchaseOrderService.rejectShortage(id, payload.get("rejectionReason")));
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
