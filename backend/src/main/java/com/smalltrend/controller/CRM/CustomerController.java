package com.smalltrend.controller.CRM;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.smalltrend.dto.CRM.CreateCustomerRequest;
import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.dto.CRM.UpdateCustomerRequest;
import com.smalltrend.service.CRM.CustomerService;

@RestController
@RequestMapping("/api/crm")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class CustomerController {
    
    private final CustomerService customerService;
    
    @GetMapping("/customers")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        List<CustomerResponse> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Integer id) {
        CustomerResponse customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    @PostMapping("/customers")
    public ResponseEntity<CustomerResponse> createCustomer(@RequestBody CreateCustomerRequest request) {
        CustomerResponse customer = customerService.createCustomer(request.getName(), request.getPhone());
        return ResponseEntity.status(HttpStatus.CREATED).body(customer);
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Integer id,
            @RequestBody UpdateCustomerRequest request) {
        CustomerResponse customer = customerService.updateCustomer(
            id, 
            request.getName(), 
            request.getPhone()
        );
        return ResponseEntity.ok(customer);
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
