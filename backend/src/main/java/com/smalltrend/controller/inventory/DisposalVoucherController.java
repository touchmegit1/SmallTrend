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
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
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

    @PostMapping("/draft")
    public ResponseEntity<DisposalVoucherResponse> saveDraft(
            @RequestBody DisposalVoucherRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(disposalVoucherService.saveDraft(request, userId));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<DisposalVoucherResponse> confirmVoucher(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(disposalVoucherService.confirmVoucher(id, userId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<DisposalVoucherResponse> cancelVoucher(@PathVariable Long id) {
        return ResponseEntity.ok(disposalVoucherService.cancelVoucher(id));
    }
}
