package com.smalltrend.controller.inventory;

import com.smalltrend.entity.SupplierContract;
import com.smalltrend.entity.enums.ContractStatus;
import com.smalltrend.service.SupplierContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-contracts")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class SupplierContractController {

    private final SupplierContractService contractService;

    @GetMapping
    public ResponseEntity<List<SupplierContract>> getAllContracts() {
        return ResponseEntity.ok(contractService.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SupplierContract>> getActiveContracts() {
        return ResponseEntity.ok(contractService.findActiveContracts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierContract> getContractById(@PathVariable Long id) {
        return contractService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<SupplierContract>> getContractsBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(contractService.findBySupplier(supplierId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupplierContract>> getContractsByStatus(@PathVariable ContractStatus status) {
        return ResponseEntity.ok(contractService.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<SupplierContract> createContract(@RequestBody SupplierContract contract) {
        return ResponseEntity.ok(contractService.save(contract));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SupplierContract> updateContractStatus(
            @PathVariable Long id,
            @RequestParam ContractStatus status) {
        return ResponseEntity.ok(contractService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable Long id) {
        contractService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
