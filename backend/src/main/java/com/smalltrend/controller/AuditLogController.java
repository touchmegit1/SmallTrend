package com.smalltrend.controller;

import com.smalltrend.entity.AuditLog;
import com.smalltrend.repository.AuditLogRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogRepository repository;

    public AuditLogController(AuditLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<AuditLog> list() {
        return repository.findAll();
    }

    @PostMapping
    @Transactional
    public AuditLog create(@RequestBody AuditLog log) {
        return repository.save(log);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
