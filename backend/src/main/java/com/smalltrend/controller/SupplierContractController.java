package com.smalltrend.controller;

import com.smalltrend.entity.SupplierContract;
import com.smalltrend.entity.enums.ContractStatus;
import com.smalltrend.service.SupplierContractService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/supplier-contracts")
public class SupplierContractController {

    @Autowired
    private SupplierContractService contractService;

    @GetMapping
    public ResponseEntity<List<SupplierContract>> getAllContracts() {
        List<SupplierContract> contracts = contractService.findAll();
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierContract> getContractById(@PathVariable Long id) {
        Optional<SupplierContract> contract = contractService.findById(id);
        return contract.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<SupplierContract>> getContractsBySupplier(@PathVariable Long supplierId) {
        List<SupplierContract> contracts = contractService.findBySupplier(supplierId);
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupplierContract>> getContractsByStatus(@PathVariable ContractStatus status) {
        List<SupplierContract> contracts = contractService.findByStatus(status);
        return ResponseEntity.ok(contracts);
    }

    @PostMapping
    public ResponseEntity<SupplierContract> createContract(@Valid @RequestBody SupplierContract contract) {
        SupplierContract savedContract = contractService.save(contract);
        return ResponseEntity.ok(savedContract);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierContract> updateContract(@PathVariable Long id, @Valid @RequestBody SupplierContract contract) {
        contract.setId(id);
        SupplierContract updatedContract = contractService.save(contract);
        return ResponseEntity.ok(updatedContract);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SupplierContract> updateContractStatus(@PathVariable Long id, @RequestBody ContractStatus status) {
        try {
            SupplierContract updatedContract = contractService.updateStatus(id, status);
            return ResponseEntity.ok(updatedContract);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable Long id) {
        contractService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/expired")
    public ResponseEntity<List<SupplierContract>> getExpiredContracts() {
        contractService.checkAndUpdateExpiredContracts();
        List<SupplierContract> expired = contractService.findByStatus(ContractStatus.EXPIRED);
        return ResponseEntity.ok(expired);
    }
}
