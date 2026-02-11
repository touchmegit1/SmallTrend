package com.smalltrend.controller;

import com.smalltrend.entity.AiInsight;
import com.smalltrend.repository.AiInsightRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/insights")
public class AiInsightController {

    private final AiInsightRepository repository;

    public AiInsightController(AiInsightRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<AiInsight> list() {
        return repository.findAll();
    }

    @PostMapping
    @Transactional
    public AiInsight create(@RequestBody AiInsight insight) {
        return repository.save(insight);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AiInsight> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
