package com.smalltrend.controller;

import com.smalltrend.entity.PurchaseOrder;
import com.smalltrend.repository.PurchaseOrderRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable Integer id) {
        Optional<PurchaseOrder> order = purchaseOrderRepository.findById(id);
        return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrdersBySupplier(@PathVariable Integer supplierId) {
        List<PurchaseOrder> orders = purchaseOrderRepository.findBySupplierId(supplierId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrdersByStatus(@PathVariable String status) {
        List<PurchaseOrder> orders = purchaseOrderRepository.findByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrdersByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<PurchaseOrder> orders = purchaseOrderRepository.findByOrderDateBetween(startDate, endDate);
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@Valid @RequestBody PurchaseOrder order) {
        if (order.getOrderDate() == null) {
            order.setOrderDate(LocalDate.now());
        }
        if (order.getStatus() == null) {
            order.setStatus("PENDING");
        }
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);
        return ResponseEntity.ok(savedOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrder(
            @PathVariable Integer id,
            @Valid @RequestBody PurchaseOrder order) {
        if (!purchaseOrderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        order.setId(id);
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrderStatus(
            @PathVariable Integer id,
            @RequestBody String status) {
        Optional<PurchaseOrder> orderOpt = purchaseOrderRepository.findById(id);
        if (!orderOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        PurchaseOrder order = orderOpt.get();
        order.setStatus(status);
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable Integer id) {
        if (!purchaseOrderRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        purchaseOrderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
