package com.smalltrend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.smalltrend.dto.CustomerResponse;
import com.smalltrend.service.CustomerService;

@RestController
@RequestMapping("/api/crm")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class CustomerController {
    
    private final CustomerService customerService;
    
    @GetMapping("/customers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers(
            @RequestParam(required = false) String phone) {
        List<CustomerResponse> customers = customerService.getAllCustomers(phone);
        return ResponseEntity.ok(customers);
    }
}
