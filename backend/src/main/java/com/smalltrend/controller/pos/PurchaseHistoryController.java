package com.smalltrend.controller.pos;

import com.smalltrend.dto.pos.SavePurchaseHistoryRequest;
import com.smalltrend.entity.PurchaseHistory;
import com.smalltrend.service.PurchaseHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos/purchase-history")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class PurchaseHistoryController {

    private final PurchaseHistoryService purchaseHistoryService;

    @PostMapping
    public ResponseEntity<Void> savePurchaseHistory(@RequestBody SavePurchaseHistoryRequest request) {
        purchaseHistoryService.savePurchaseHistory(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PurchaseHistory>> getCustomerHistory(@PathVariable Long customerId) {
        List<PurchaseHistory> history = purchaseHistoryService.getCustomerHistory(customerId);
        return ResponseEntity.ok(history);
    }
}
