package com.smalltrend.controller;

import com.smalltrend.entity.Ticket;
import com.smalltrend.entity.enums.TicketStatus;
import com.smalltrend.repository.TicketRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository repository;

    public TicketController(TicketRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Ticket> list() {
        return repository.findAll();
    }

    @GetMapping("/status/{status}")
    public List<Ticket> byStatus(@PathVariable TicketStatus status) {
        return repository.findByStatus(status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> get(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public Ticket create(@RequestBody Ticket ticket) {
        return repository.save(ticket);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Ticket> update(@PathVariable Long id, @RequestBody Ticket ticket) {
        return repository.findById(id)
                .map(existing -> {
                    ticket.setId(existing.getId());
                    return ResponseEntity.ok(repository.save(ticket));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long id, @RequestParam TicketStatus status) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setStatus(status);
                    return ResponseEntity.ok(repository.save(existing));
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
