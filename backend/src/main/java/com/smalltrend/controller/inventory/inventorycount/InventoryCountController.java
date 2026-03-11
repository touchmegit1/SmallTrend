package com.smalltrend.controller.inventory.inventorycount;

import com.smalltrend.dto.inventory.inventorycount.InventoryCountRequest;
import com.smalltrend.dto.inventory.inventorycount.InventoryCountResponse;
import com.smalltrend.service.inventory.inventorycount.InventoryCountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/inventory-counts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryCountController {

    private final InventoryCountService countService;

    // ─── List all counts ─────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<InventoryCountResponse>> getAllCounts() {
        return ResponseEntity.ok(countService.getAllCounts());
    }

    // ─── Get by ID ───────────────────────────────────────────
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<InventoryCountResponse> getCountById(@PathVariable Integer id) {
        return ResponseEntity.ok(countService.getCountById(id));
    }

    // ─── Generate next code ──────────────────────────────────
    @GetMapping("/next-code")
    public ResponseEntity<Map<String, String>> getNextCode() {
        String code = countService.generateCode();
        return ResponseEntity.ok(Map.of("code", code));
    }

    // ─── Save as Draft ───────────────────────────────────────
    @PostMapping("/draft")
    public ResponseEntity<InventoryCountResponse> saveDraft(@RequestBody InventoryCountRequest request) {
        InventoryCountResponse response = countService.saveDraft(request);
        return ResponseEntity.ok(response);
    }

    // ─── Update existing count ───────────────────────────────
    @PutMapping("/{id:\\d+}")
    public ResponseEntity<InventoryCountResponse> updateCount(
            @PathVariable Integer id,
            @RequestBody InventoryCountRequest request) {
        InventoryCountResponse response = countService.updateCount(id, request);
        return ResponseEntity.ok(response);
    }

    // ─── Confirm (new: create + confirm) ─────────────────────
    @PostMapping("/confirm")
    public ResponseEntity<InventoryCountResponse> createAndConfirm(@RequestBody InventoryCountRequest request) {
        InventoryCountResponse response = countService.createAndConfirm(request);
        return ResponseEntity.ok(response);
    }

    // ─── Confirm existing count ──────────────────────────────
    @PutMapping("/{id:\\d+}/confirm")
    public ResponseEntity<InventoryCountResponse> confirmExisting(
            @PathVariable Integer id,
            @RequestBody InventoryCountRequest request) {
        InventoryCountResponse response = countService.confirmCount(id, request);
        return ResponseEntity.ok(response);
    }

    // ─── Cancel ──────────────────────────────────────────────
    @PutMapping("/{id:\\d+}/cancel")
    public ResponseEntity<InventoryCountResponse> cancelCount(@PathVariable Integer id) {
        InventoryCountResponse response = countService.cancelCount(id);
        return ResponseEntity.ok(response);
    }

    // ─── Submit for approval (existing) ─────────────────────
    @PutMapping("/{id:\\d+}/submit")
    public ResponseEntity<InventoryCountResponse> submitForApproval(
            @PathVariable Integer id,
            @RequestBody InventoryCountRequest request) {
        InventoryCountResponse response = countService.submitForApproval(id, request);
        return ResponseEntity.ok(response);
    }

    // ─── Submit for approval (create new + submit) ──────────
    @PostMapping("/submit")
    public ResponseEntity<InventoryCountResponse> createAndSubmitForApproval(@RequestBody InventoryCountRequest request) {
        InventoryCountResponse response = countService.createAndSubmitForApproval(request);
        return ResponseEntity.ok(response);
    }

    // ─── Approve ────────────────────────────────────────────
    @PutMapping("/{id:\\d+}/approve")
    public ResponseEntity<InventoryCountResponse> approveCount(@PathVariable Integer id) {
        InventoryCountResponse response = countService.approveCount(id);
        return ResponseEntity.ok(response);
    }

    // ─── Reject ─────────────────────────────────────────────
    @PutMapping("/{id:\\d+}/reject")
    public ResponseEntity<InventoryCountResponse> rejectCount(
            @PathVariable Integer id,
            @RequestBody InventoryCountRequest request) {
        InventoryCountResponse response = countService.rejectCount(id, request.getRejectionReason());
        return ResponseEntity.ok(response);
    }

    // ─── Delete ─────────────────────────────────────────────
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> deleteCount(@PathVariable Integer id) {
        countService.deleteCount(id);
        return ResponseEntity.noContent().build();
    }
}
