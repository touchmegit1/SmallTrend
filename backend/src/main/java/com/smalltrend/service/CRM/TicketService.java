package com.smalltrend.service.CRM;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.smalltrend.dto.CRM.CreateTicketRequest;
import com.smalltrend.dto.CRM.TicketResponse;
import com.smalltrend.dto.CRM.UpdateTicketRequest;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.Ticket;
import com.smalltrend.entity.User;
import com.smalltrend.entity.enums.TicketPriority;
import com.smalltrend.entity.enums.TicketStatus;
import com.smalltrend.entity.enums.TicketType;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.TicketRepository;
import com.smalltrend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final ProductVariantRepository productVariantRepository;

    // Mapping TicketType -> code prefix
    private static final Map<TicketType, String> TYPE_CODE_PREFIX = Map.of(
            TicketType.REFUND, "TCK-REF",
            TicketType.ORDER, "TCK-ORD",
            TicketType.ISSUE, "TCK-ISS",
            TicketType.SUPPLIER, "TCK-SUP",
            TicketType.SHIFT_CHANGE, "TCK-SHF",
            TicketType.AI_SUGGESTION, "TCK-AIS"
    );

    /**
     * Generate categorized ticket code like TCK-REF-001, TCK-ORD-002, etc.
     * Checks for uniqueness to avoid constraint violations.
     */
    private String generateTicketCode(TicketType type) {
        String prefix = TYPE_CODE_PREFIX.getOrDefault(type, "TCK-GEN");
        long count = ticketRepository.countByTicketType(type);
        String code;
        do {
            count++;
            code = String.format("%s-%03d", prefix, count);
        } while (!ticketRepository.findByTicketCode(code).isEmpty());
        return code;
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse).toList();
    }

    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {
        TicketType ticketType = TicketType.valueOf(request.getTicketType());

        Ticket ticket = Ticket.builder()
                .ticketCode(generateTicketCode(ticketType))
                .ticketType(ticketType)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null
                        ? TicketPriority.valueOf(request.getPriority())
                        : TicketPriority.NORMAL)
                .relatedEntityType(request.getRelatedEntityType())
                .relatedEntityId(request.getRelatedEntityId())
                .build();

        if (request.getAssignedToUserId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            ticket.setAssignedTo(assignedTo);
        }

        // REFUND tickets: auto-resolve and restock inventory
        if (ticketType == TicketType.REFUND) {
            ticket.setStatus(TicketStatus.RESOLVED);
            ticket.setResolvedAt(LocalDateTime.now());
            ticket.setResolution("Tự động hoàn tiền và nhập kho sản phẩm");

            // Restock inventory by SKU
            if (request.getSku() != null && !request.getSku().trim().isEmpty()
                    && request.getRefundQuantity() != null && request.getRefundQuantity() > 0) {
                ProductVariant variant = productVariantRepository.findBySku(request.getSku().trim())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với SKU: " + request.getSku()));
                restockInventory(variant.getId(), request.getRefundQuantity());
            }
        }

        Ticket saved = ticketRepository.save(ticket);
        return mapToResponse(saved);
    }

    /**
     * Add quantity back to inventory_stock for the given variant.
     * Finds the first stock record for the variant and increases its quantity.
     */
    private void restockInventory(Integer variantId, Integer quantity) {
        inventoryStockRepository.findByVariantId(variantId).ifPresent(stock -> {
            stock.setQuantity(stock.getQuantity() + quantity);
            inventoryStockRepository.save(stock);
        });
    }

    /**
     * Lookup product variant by SKU — runs in transaction to access lazy collections.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> lookupVariantBySku(String sku) {
        var variants = productVariantRepository.findBySkuContainingIgnoreCase(sku);
        return variants.stream().map(v -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", v.getId());
            map.put("sku", v.getSku());
            map.put("barcode", v.getBarcode());
            map.put("sellPrice", v.getSellPrice());
            map.put("productName", v.getProduct() != null ? v.getProduct().getName() : null);
            map.put("unitName", v.getUnit() != null ? v.getUnit().getName() : null);
            int totalStock = 0;
            if (v.getInventoryStocks() != null) {
                totalStock = v.getInventoryStocks().stream()
                        .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0).sum();
            }
            map.put("totalStock", totalStock);
            return map;
        }).toList();
    }

    public TicketResponse updateTicket(Long id, UpdateTicketRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (request.getTitle() != null) {
            ticket.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            ticket.setPriority(TicketPriority.valueOf(request.getPriority()));
        }
        if (request.getStatus() != null) {
            TicketStatus newStatus = TicketStatus.valueOf(request.getStatus());
            ticket.setStatus(newStatus);
            if (newStatus == TicketStatus.RESOLVED) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }
        if (request.getAssignedToUserId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            ticket.setAssignedTo(assignedTo);
        }
        if (request.getResolution() != null) {
            ticket.setResolution(request.getResolution());
        }

        Ticket updated = ticketRepository.save(ticket);
        return mapToResponse(updated);
    }

    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException("Ticket not found");
        }
        ticketRepository.deleteById(id);
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTicketCode(ticket.getTicketCode());
        response.setTicketType(ticket.getTicketType() != null ? ticket.getTicketType().name() : "");
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setStatus(ticket.getStatus().name());
        response.setPriority(ticket.getPriority().name());
        response.setRelatedEntityType(ticket.getRelatedEntityType());
        response.setRelatedEntityId(ticket.getRelatedEntityId());
        response.setResolution(ticket.getResolution());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());

        if (ticket.getCreatedBy() != null) {
            response.setCreatedByUserId(ticket.getCreatedBy().getId());
            response.setCreatedByName(ticket.getCreatedBy().getFullName());
        }
        if (ticket.getAssignedTo() != null) {
            response.setAssignedToUserId(ticket.getAssignedTo().getId());
            response.setAssignedToName(ticket.getAssignedTo().getFullName());
        }
        if (ticket.getResolvedBy() != null) {
            response.setResolvedByUserId(ticket.getResolvedBy().getId());
            response.setResolvedByName(ticket.getResolvedBy().getFullName());
        }

        return response;
    }
}
