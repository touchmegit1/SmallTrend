package com.smalltrend.controller.CRM;

import com.smalltrend.dto.CRM.CreateLoyaltyGiftRequest;
import com.smalltrend.dto.CRM.LoyaltyGiftResponse;
import com.smalltrend.dto.CRM.RedeemGiftRequest;
import com.smalltrend.service.CRM.LoyaltyGiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crm/loyalty-gifts")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class LoyaltyGiftController {

    private final LoyaltyGiftService loyaltyGiftService;

    @GetMapping
    public ResponseEntity<List<LoyaltyGiftResponse>> getAllGifts() {
        return ResponseEntity.ok(loyaltyGiftService.getAllActiveGifts());
    }

    @PostMapping
    public ResponseEntity<?> createGift(@RequestBody CreateLoyaltyGiftRequest request) {
        try {
            LoyaltyGiftResponse gift = loyaltyGiftService.createGift(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(gift);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGift(@PathVariable Integer id) {
        loyaltyGiftService.deleteGift(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/redeem")
    public ResponseEntity<?> redeemGift(@RequestBody RedeemGiftRequest request) {
        try {
            LoyaltyGiftResponse gift = loyaltyGiftService.redeemGift(request);
            return ResponseEntity.ok(gift);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/history/{customerId}")
    public ResponseEntity<?> getCustomerHistory(@PathVariable Integer customerId) {
        return ResponseEntity.ok(loyaltyGiftService.getCustomerRedemptionHistory(customerId));
    }
}
