package com.smalltrend.controller.inventory;

import com.smalltrend.dto.inventory.disposal.*;
import com.smalltrend.service.inventory.DisposalVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/disposal-vouchers")
@RequiredArgsConstructor
public class DisposalVoucherController {

    private final DisposalVoucherService disposalVoucherService;

    @GetMapping
    public ResponseEntity<List<DisposalVoucherResponse>> getAllDisposalVouchers() {
        return ResponseEntity.ok(disposalVoucherService.getAllDisposalVouchers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisposalVoucherResponse> getDisposalVoucherById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(disposalVoucherService.getDisposalVoucherById(id));
    }

    @GetMapping("/next-code")
    public ResponseEntity<Map<String, String>> getNextCode() {
        return ResponseEntity.ok(Map.of("code", disposalVoucherService.generateNextCode()));
    }

    @GetMapping("/expired-batches")
    public ResponseEntity<List<ExpiredBatchResponse>> getExpiredBatches(
            @RequestParam(value = "locationId", required = false) Long locationId) {
        return ResponseEntity.ok(disposalVoucherService.getExpiredBatches(locationId));
    }

    @PostMapping("/draft")
    public ResponseEntity<DisposalVoucherResponse> saveDraft(
            @RequestBody DisposalVoucherRequest request,
            @RequestParam("userId") Long userId) {
        return ResponseEntity.ok(disposalVoucherService.saveDraft(request, userId));
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<DisposalVoucherResponse> submitForApproval(@PathVariable("id") Long id) {
        return ResponseEntity.ok(disposalVoucherService.submitForApproval(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<DisposalVoucherResponse> approveVoucher(
            @PathVariable("id") Long id,
            @RequestParam("userId") Long userId) {
        return ResponseEntity.ok(disposalVoucherService.approveVoucher(id, userId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<DisposalVoucherResponse> rejectVoucher(
            @PathVariable("id") Long id,
            @RequestParam("reason") String reason) {
        return ResponseEntity.ok(disposalVoucherService.rejectVoucher(id, reason));
    }
}
