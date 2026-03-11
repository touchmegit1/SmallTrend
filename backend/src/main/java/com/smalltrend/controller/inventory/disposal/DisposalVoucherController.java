package com.smalltrend.controller.inventory.disposal;

import com.smalltrend.dto.inventory.disposal.*;
import com.smalltrend.service.inventory.disposal.DisposalVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/disposal-vouchers")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000" })
public class DisposalVoucherController {

    private final DisposalVoucherService disposalVoucherService;

    @GetMapping
    public ResponseEntity<List<DisposalVoucherResponse>> getAllDisposalVouchers() {
        return ResponseEntity.ok(disposalVoucherService.getAllDisposalVouchers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisposalVoucherResponse> getDisposalVoucherById(@PathVariable Long id) {
        return ResponseEntity.ok(disposalVoucherService.getDisposalVoucherById(id));
    }

    @GetMapping("/next-code")
    public ResponseEntity<Map<String, String>> getNextCode() {
        return ResponseEntity.ok(Map.of("code", disposalVoucherService.generateNextCode()));
    }

    @GetMapping("/expired-batches")
    public ResponseEntity<List<ExpiredBatchResponse>> getExpiredBatches(
            @RequestParam(required = false) Long locationId) {
        return ResponseEntity.ok(disposalVoucherService.getExpiredBatches(locationId));
    }

    @PostMapping
    public ResponseEntity<DisposalVoucherResponse> createDisposalVoucher(
            @RequestBody DisposalVoucherRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(disposalVoucherService.createDisposalVoucher(request, userId));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<DisposalVoucherResponse> approveVoucher(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(disposalVoucherService.approveVoucher(id, userId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<DisposalVoucherResponse> rejectVoucher(
            @PathVariable Long id,
            @RequestParam String reason) {
        return ResponseEntity.ok(disposalVoucherService.rejectVoucher(id, reason));
    }
}
