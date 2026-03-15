package com.smalltrend.controller.CRM;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.smalltrend.dto.CRM.CreateTicketRequest;
import com.smalltrend.dto.CRM.TicketResponse;
import com.smalltrend.dto.CRM.UpdateTicketRequest;
import com.smalltrend.entity.User;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.service.CRM.TicketService;

@RestController
@RequestMapping("/api/crm")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        TicketResponse ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody CreateTicketRequest request) {
        try {
            TicketResponse ticket = ticketService.createTicket(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/tickets/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @RequestBody UpdateTicketRequest request) {
        TicketResponse ticket = ticketService.updateTicket(id, request);
        return ResponseEntity.ok(ticket);
    }

    @DeleteMapping("/tickets/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lookup users by role ID — for assigning tickets
     */
    @GetMapping("/tickets/lookup/users-by-role/{roleId}")
    public ResponseEntity<List<Map<String, Object>>> getUsersByRole(@PathVariable Integer roleId) {
        List<User> users = userRepository.findByRoleId(roleId);
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail());
            map.put("roleName", u.getRole() != null ? u.getRole().getName() : null);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * Lookup product variant by SKU — for refund restock.
     * Delegates to service to keep transaction open for lazy-loaded collections.
     */
    @GetMapping("/tickets/lookup/variant-by-sku")
    public ResponseEntity<List<Map<String, Object>>> getVariantBySku(@RequestParam String sku) {
        List<Map<String, Object>> result = ticketService.lookupVariantBySku(sku);
        return ResponseEntity.ok(result);
    }
}
