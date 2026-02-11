package com.smalltrend.controller;

import com.smalltrend.entity.SupplierProfile;
import com.smalltrend.repository.SupplierProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers/profiles")
public class SupplierProfileController {

    private final SupplierProfileRepository repository;

    public SupplierProfileController(SupplierProfileRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<SupplierProfile> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierProfile> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-supplier/{supplierId}")
    public ResponseEntity<SupplierProfile> getBySupplier(@PathVariable Long supplierId) {
        SupplierProfile profile = repository.findBySupplierId(supplierId);
        if (profile == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(profile);
    }

    @PostMapping
    @Transactional
    public SupplierProfile create(@RequestBody SupplierProfile profile) {
        return repository.save(profile);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<SupplierProfile> update(@PathVariable Long id, @RequestBody SupplierProfile profile) {
        return repository.findById(id)
                .map(existing -> {
                    profile.setId(existing.getId());
                    return ResponseEntity.ok(repository.save(profile));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
