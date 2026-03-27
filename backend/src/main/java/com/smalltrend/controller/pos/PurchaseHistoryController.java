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
public class PurchaseHistoryController {

    private final PurchaseHistoryService purchaseHistoryService;

    @PostMapping
    // Thực hiện save purchase history.
    public ResponseEntity<Void> savePurchaseHistory(@RequestBody SavePurchaseHistoryRequest request) {
        purchaseHistoryService.savePurchaseHistory(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refund")
    // Thực hiện refund purchase items.
    public ResponseEntity<Void> refundPurchaseItems(@RequestBody SavePurchaseHistoryRequest request) {
        purchaseHistoryService.refundPurchaseItems(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/customer/{customerId}")
    // Lấy customer history.
    public ResponseEntity<List<PurchaseHistory>> getCustomerHistory(@PathVariable Long customerId) {
        List<PurchaseHistory> history = purchaseHistoryService.getCustomerHistory(customerId);
        return ResponseEntity.ok(history);
    }
}
