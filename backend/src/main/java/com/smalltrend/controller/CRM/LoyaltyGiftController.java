package com.smalltrend.controller.CRM;

import com.smalltrend.dto.CRM.CreateLoyaltyGiftRequest;
import com.smalltrend.dto.CRM.LoyaltyGiftResponse;
import com.smalltrend.dto.CRM.RedeemGiftRequest;
import com.smalltrend.dto.CRM.UpdateLoyaltyGiftRequest;
import com.smalltrend.service.CRM.LoyaltyGiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crm/loyalty-gifts")
@RequiredArgsConstructor
public class LoyaltyGiftController {

    private final LoyaltyGiftService loyaltyGiftService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<List<LoyaltyGiftResponse>> getAllGifts() {
        return ResponseEntity.ok(loyaltyGiftService.getAllActiveGifts());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> updateGift(@PathVariable Integer id, @RequestBody UpdateLoyaltyGiftRequest request) {
        try {
            LoyaltyGiftResponse gift = loyaltyGiftService.updateGift(id, request);
            return ResponseEntity.ok(gift);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/{id}/update")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> updateGiftViaPost(@PathVariable Integer id, @RequestBody UpdateLoyaltyGiftRequest request) {
        return updateGift(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteGift(@PathVariable Integer id) {
        loyaltyGiftService.deleteGift(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<?> getCustomerHistory(@PathVariable Integer customerId) {
        return ResponseEntity.ok(loyaltyGiftService.getCustomerRedemptionHistory(customerId));
    }

    @PostMapping("/reduce-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> reduceVariantStock(@RequestBody Map<String, Integer> request) {
        try {
            Integer variantId = request.get("variantId");
            Integer quantity = request.get("quantity");
            
            if (variantId == null || quantity == null) {
                return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                    put("message", "variantId và quantity là bắt buộc");
                }});
            }
            
            loyaltyGiftService.reduceVariantStock(variantId, quantity);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Trừ stock thành công");
            }});
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
