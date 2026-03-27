package com.smalltrend.controller.CRM;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    @GetMapping("/tickets")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/tickets/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable("id") Long id) {
        TicketResponse ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/tickets")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
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
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','MANAGER','ROLE_MANAGER','CASHIER','ROLE_CASHIER','INVENTORY_STAFF','ROLE_INVENTORY_STAFF','SALES_STAFF','ROLE_SALES_STAFF')")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable("id") Long id,
            @RequestBody UpdateTicketRequest request) {
        TicketResponse ticket = ticketService.updateTicket(id, request);
        return ResponseEntity.ok(ticket);
    }

    @DeleteMapping("/tickets/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<Void> deleteTicket(@PathVariable("id") Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lookup users by role ID — for assigning tickets
     */
    @GetMapping("/tickets/lookup/users-by-role/{roleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<List<Map<String, Object>>> getUsersByRole(@PathVariable("roleId") Integer roleId) {
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
     * Lookup product variant by SKU — for refund restock. Delegates to service
     * to keep transaction open for lazy-loaded collections.
     */
    @GetMapping("/tickets/lookup/variant-by-sku")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'MANAGER', 'SALES_STAFF')")
    public ResponseEntity<List<Map<String, Object>>> getVariantBySku(@RequestParam("sku") String sku) {
        List<Map<String, Object>> result = ticketService.lookupVariantBySku(sku);
        return ResponseEntity.ok(result);
    }

    /**
     * Search product variants by SKU or product name — for gift reward lookup.
     * Supports fuzzy search on both SKU and product name fields.
     */
    @GetMapping("/tickets/lookup/search-variants")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<List<Map<String, Object>>> searchVariants(@RequestParam("keyword") String keyword) {
        List<Map<String, Object>> result = ticketService.searchVariantsByKeyword(keyword);
        return ResponseEntity.ok(result);
    }
}
