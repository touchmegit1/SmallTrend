package com.smalltrend.controller;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.order.OrderRequest;
import com.smalltrend.dto.order.OrderResponse;
import com.smalltrend.dto.order.OrderStatusHistoryResponse;
import com.smalltrend.dto.order.OrderStatusUpdateRequest;
import com.smalltrend.service.SaleOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sale-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class SaleOrderController {

    private final SaleOrderService saleOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'SALES_STAFF')")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer cashierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<OrderResponse> responses = saleOrderService.listOrders(status, cashierId, fromDate, toDate);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'SALES_STAFF')")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(saleOrderService.getById(id));
    }

    @GetMapping("/code/{orderCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'SALES_STAFF')")
    public ResponseEntity<?> getByCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(saleOrderService.getByOrderCode(orderCode));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<?> create(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(saleOrderService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody OrderRequest request) {
        return ResponseEntity.ok(saleOrderService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(saleOrderService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        saleOrderService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Sale order deleted"));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'SALES_STAFF')")
    public ResponseEntity<?> listHistory(@PathVariable Integer id) {
        List<OrderStatusHistoryResponse> responses = saleOrderService.listHistory(id);
        return ResponseEntity.ok(responses);
    }
}
