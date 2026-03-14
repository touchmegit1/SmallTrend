package com.smalltrend.controller.inventory;

import com.smalltrend.dto.inventory.StockAdjustRequest;
import com.smalltrend.dto.inventory.StockImportRequest;
import com.smalltrend.service.inventory.InventoryStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory/stock")
@RequiredArgsConstructor
public class InventoryStockController {

    private final InventoryStockService inventoryStockService;

    @GetMapping("/variant/{variantId}/total")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public ResponseEntity<Integer> getTotalStockForVariant(@PathVariable Integer variantId) {
        return ResponseEntity.ok(inventoryStockService.getTotalStockForVariant(variantId));
    }

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('INVENTORY_MANAGE')")
    public ResponseEntity<Void> importStock(@RequestBody StockImportRequest request) {
        inventoryStockService.importStock(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAuthority('INVENTORY_MANAGE')")
    public ResponseEntity<Void> adjustStock(@RequestBody StockAdjustRequest request) {
        inventoryStockService.adjustStock(request);
        return ResponseEntity.ok().build();
    }
}
