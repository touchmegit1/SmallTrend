package com.smalltrend.controller.CRM;

import com.smalltrend.dto.CRM.CustomerTierResponse;
import com.smalltrend.dto.CRM.UpdateCustomerTierRequest;
import com.smalltrend.service.CRM.CustomerTierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm/tiers")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000" })
public class CustomerTierController {

    private final CustomerTierService customerTierService;

    @GetMapping
    public ResponseEntity<List<CustomerTierResponse>> getAllTiers() {
        return ResponseEntity.ok(customerTierService.getAllTiers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerTierResponse> updateTier(
            @PathVariable Integer id,
            @RequestBody UpdateCustomerTierRequest request) {
        return ResponseEntity.ok(customerTierService.updateTier(id, request));
    }
}
