package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.inventorycount.*;
import com.smalltrend.entity.InventoryCount;
import com.smalltrend.exception.InventoryCountException;
import com.smalltrend.entity.InventoryCountItem;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Location;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.StockMovement;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.repository.InventoryCountItemRepository;
import com.smalltrend.repository.InventoryCountRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.StockMovementRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.LocationRepository;
import com.smalltrend.repository.ProductBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryCountService {

    private final InventoryCountRepository countRepository;
    private final InventoryCountItemRepository itemRepository;
    private final LocationRepository locationRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryOutOfStockNotificationService outOfStockNotificationService;

    private static final Map<String, Set<String>> ALLOWED_STATUS_TRANSITIONS = buildAllowedTransitions();
    private static final Set<String> FINALIZED_STATUSES = Set.of("CONFIRMED", "CANCELLED");

    // ─── LIST ────────────────────────────────────────────────

    public List<InventoryCountResponse> getAllCounts() {
        return countRepository.findAll().stream()
                .map(this::toListResponse)
                .collect(Collectors.toList());
    }

    // ─── GET BY ID ───────────────────────────────────────────

    public InventoryCountResponse getCountById(Integer id) {
        InventoryCount count = findCountOrThrow(id);
        return toDetailResponse(count);
    }

    // ─── GENERATE CODE ───────────────────────────────────────

    public String generateCode() {
        int year = Year.now().getValue();
        String prefix = "IC-" + year + "-";

        List<InventoryCount> all = countRepository.findAll();
        int maxNum = 0;
        for (InventoryCount ic : all) {
            String code = ic.getCode();
            if (code != null && code.startsWith(prefix)) {
                try {
                    int num = Integer.parseInt(code.substring(prefix.length()));
                    if (num > maxNum) maxNum = num;
                } catch (NumberFormatException ignored) {}
            }
        }

        return prefix + String.format("%04d", maxNum + 1);
    }

    // ─── SAVE DRAFT ──────────────────────────────────────────

    @Transactional
    public InventoryCountResponse saveDraft(InventoryCountRequest request) {
        String code = generateCode();

        InventoryCount count = InventoryCount.builder()
                .code(code)
                .status("DRAFT")
                .notes(request.getNotes())
                .createdBy(1) // TODO: from auth
                .createdAt(LocalDateTime.now())
                .build();

        setLocation(count, request.getLocationId());
        calculateTotals(count, request.getItems());

        count = countRepository.save(count);
        saveItems(count, request.getItems());

        return toDetailResponse(count);
    }

    // ─── UPDATE ──────────────────────────────────────────────

    @Transactional
    public InventoryCountResponse updateCount(Integer id, InventoryCountRequest request) {
        InventoryCount count = findCountOrThrow(id);

        assertNotFinalized(count, "cập nhật");

        count.setNotes(request.getNotes());
        if (request.getStatus() != null) {
            assertTransition(count.getStatus(), request.getStatus());
            count.setStatus(request.getStatus());
        }

        setLocation(count, request.getLocationId());
        calculateTotals(count, request.getItems());

        itemRepository.deleteByInventoryCountId(id);
        count = countRepository.save(count);
        saveItems(count, request.getItems());

        return toDetailResponse(count);
    }

    // ─── CONFIRM ─────────────────────────────────────────────

    @Transactional
    public InventoryCountResponse confirmCount(Integer id, InventoryCountRequest request) {
        InventoryCount count = findCountOrThrow(id);

        assertNotFinalized(count, "xác nhận");
        validateItemsRequired(request.getItems());
        validateLocationRequired(request.getLocationId());

        assertTransition(count.getStatus(), "CONFIRMED");
        count.setStatus("CONFIRMED");
        count.setNotes(request.getNotes());
        count.setConfirmedBy(1); // TODO: from auth
        count.setConfirmedAt(LocalDateTime.now());

        setLocation(count, request.getLocationId());
        calculateTotals(count, request.getItems());

        itemRepository.deleteByInventoryCountId(id);
        count = countRepository.save(count);
        saveItems(count, request.getItems());

        adjustStock(count);

        return toDetailResponse(count);
    }

    // ─── CONFIRM (create new + confirm) ──────────────────────

    @Transactional
    public InventoryCountResponse createAndConfirm(InventoryCountRequest request) {
        validateItemsRequired(request.getItems());
        validateLocationRequired(request.getLocationId());

        String code = generateCode();

        InventoryCount count = InventoryCount.builder()
                .code(code)
                .status("CONFIRMED")
                .notes(request.getNotes())
                .createdBy(1)
                .confirmedBy(1)
                .createdAt(LocalDateTime.now())
                .confirmedAt(LocalDateTime.now())
                .build();

        setLocation(count, request.getLocationId());
        calculateTotals(count, request.getItems());

        count = countRepository.save(count);
        saveItems(count, request.getItems());

        // Cập nhật tồn kho thực tế
        adjustStock(count);

        return toDetailResponse(count);
    }

    // ─── SUBMIT FOR APPROVAL ─────────────────────────────────

    @Transactional
    public InventoryCountResponse submitForApproval(Integer id, InventoryCountRequest request) {
        InventoryCount count = findCountOrThrow(id);

        validateItemsRequired(request.getItems());
        validateLocationRequired(request.getLocationId());

        assertTransition(count.getStatus(), "PENDING");
        count.setStatus("PENDING");
        count.setNotes(request.getNotes());
        count.setRejectionReason(null);

        setLocation(count, request.getLocationId());
        calculateTotals(count, request.getItems());

        // Delete old items and save new ones
        itemRepository.deleteByInventoryCountId(id);
        count = countRepository.save(count);
        saveItems(count, request.getItems());

        return toDetailResponse(count);
    }

    // ─── SUBMIT FOR APPROVAL (create new + submit) ──────────

    @Transactional
    public InventoryCountResponse createAndSubmitForApproval(InventoryCountRequest request) {
        validateItemsRequired(request.getItems());
        validateLocationRequired(request.getLocationId());

        String code = generateCode();

        InventoryCount count = InventoryCount.builder()
                .code(code)
                .status("PENDING")
                .notes(request.getNotes())
                .createdBy(1) // TODO: from auth
                .createdAt(LocalDateTime.now())
                .build();

        setLocation(count, request.getLocationId());
        calculateTotals(count, request.getItems());

        count = countRepository.save(count);
        saveItems(count, request.getItems());

        return toDetailResponse(count);
    }

    // ─── APPROVE ─────────────────────────────────────────────

    @Transactional
    public InventoryCountResponse approveCount(Integer id) {
        InventoryCount count = findCountOrThrow(id);

        assertTransition(count.getStatus(), "CONFIRMED");

        count.setStatus("CONFIRMED");
        count.setConfirmedBy(1); // TODO: from auth
        count.setConfirmedAt(LocalDateTime.now());
        count.setRejectionReason(null);

        count = countRepository.save(count);

        // Cập nhật tồn kho thực tế
        adjustStock(count);

        return toDetailResponse(count);
    }

    // ─── REJECT ──────────────────────────────────────────────

    @Transactional
    public InventoryCountResponse rejectCount(Integer id, String rejectionReason) {
        InventoryCount count = findCountOrThrow(id);

        assertTransition(count.getStatus(), "REJECTED");

        count.setStatus("REJECTED");
        count.setRejectionReason(rejectionReason);

        count = countRepository.save(count);
        return toDetailResponse(count);
    }

    // ─── CANCEL ──────────────────────────────────────────────

    @Transactional
    public InventoryCountResponse cancelCount(Integer id) {
        InventoryCount count = findCountOrThrow(id);

        assertTransition(count.getStatus(), "CANCELLED");

        count.setStatus("CANCELLED");
        count = countRepository.save(count);
        return toListResponse(count);
    }
    // ═══════════════════════════════════════════════════════════
    //  7. Xóa phiếu (Delete)
    // ═══════════════════════════════════════════════════════════

    /** Xóa phiếu kiểm kê (chỉ cho phép xóa DRAFT hoặc CANCELLED) */
    @Transactional
    public void deleteCount(Integer id) {
        InventoryCount count = findCountOrThrow(id);

        assertNotFinalized(count, "xóa");

        // Xóa items trước (do foreign key constraint)
        itemRepository.deleteByInventoryCountId(id);
        countRepository.delete(count);
    }

    // ═══════════════════════════════════════════════════════════
    //  Private Helpers
    // ═══════════════════════════════════════════════════════════

    private static Map<String, Set<String>> buildAllowedTransitions() {
        Map<String, Set<String>> transitions = new HashMap<>();
        transitions.put("DRAFT", new HashSet<>(Arrays.asList("COUNTING", "PENDING", "CANCELLED")));
        transitions.put("COUNTING", new HashSet<>(Arrays.asList("PENDING", "CONFIRMED", "CANCELLED")));
        transitions.put("PENDING", new HashSet<>(Arrays.asList("CONFIRMED", "REJECTED")));
        transitions.put("REJECTED", new HashSet<>(Collections.singletonList("DRAFT")));
        transitions.put("CONFIRMED", new HashSet<>());
        transitions.put("CANCELLED", new HashSet<>());
        return transitions;
    }

    private InventoryCount findCountOrThrow(Integer id) {
        return countRepository.findById(id)
                .orElseThrow(() -> InventoryCountException.countNotFound(id));
    }

    private void assertTransition(String currentStatus, String targetStatus) {
        if (currentStatus == null || targetStatus == null) {
            throw InventoryCountException.invalidStatusTransition(currentStatus, targetStatus);
        }

        if (currentStatus.equals(targetStatus)) {
            return;
        }

        Set<String> allowedStatuses = ALLOWED_STATUS_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
        if (!allowedStatuses.contains(targetStatus)) {
            throw InventoryCountException.invalidStatusTransition(currentStatus, targetStatus);
        }
    }

    private void assertNotFinalized(InventoryCount count, String action) {
        if (FINALIZED_STATUSES.contains(count.getStatus())) {
            throw InventoryCountException.countAlreadyFinalized(action, count.getStatus());
        }
    }

    private void validateItemsRequired(List<InventoryCountItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw InventoryCountException.countItemsRequired();
        }
    }

    private void validateLocationRequired(Integer locationId) {
        if (locationId == null) {
            throw InventoryCountException.locationRequired();
        }
    }

    /**
     * Điều chỉnh tồn kho dựa trên kết quả kiểm kê.
     * Khi thiếu hàng (diff < 0), trừ dần trên toàn bộ stock của variant trong location
     * để tổng tồn kho sau kiểm kê khớp với số thực tế.
     */
    private void adjustStock(InventoryCount count) {
        List<InventoryCountItem> items = itemRepository.findByInventoryCountId(count.getId());
        Location location = count.getLocation();

        for (InventoryCountItem item : items) {
            int diff = item.getDifferenceQuantity() != null ? item.getDifferenceQuantity() : 0;
            if (diff == 0) continue;

            Integer variantId = item.getVariantId();
            if (variantId == null) {
                throw InventoryCountException.variantIdRequired();
            }

            ProductVariant variant = productVariantRepository.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Khong tim thay variant: " + variantId));

            List<InventoryStock> stocks = inventoryStockRepository.findByVariantId(variantId).stream()
                    .filter(s -> location == null || (s.getLocation() != null && s.getLocation().getId().equals(location.getId())))
                    .collect(Collectors.toList());

            ProductBatch movementBatch = null;

            if (diff < 0) {
                int remaining = -diff;

                for (InventoryStock stock : stocks) {
                    if (remaining <= 0) break;

                    int currentQty = stock.getQuantity() != null ? stock.getQuantity() : 0;
                    if (currentQty <= 0) continue;

                    int deducted = Math.min(currentQty, remaining);
                    stock.setQuantity(currentQty - deducted);
                    InventoryStock savedStock = inventoryStockRepository.save(stock);
                    outOfStockNotificationService.handleStockTransition(savedStock, currentQty, savedStock.getQuantity(), "INVENTORY_COUNT");

                    if (movementBatch == null) {
                        movementBatch = stock.getBatch();
                    }

                    remaining -= deducted;
                }
            } else {
                if (!stocks.isEmpty()) {
                    InventoryStock stock = stocks.get(0);
                    int currentQty = stock.getQuantity() != null ? stock.getQuantity() : 0;
                    stock.setQuantity(currentQty + diff);
                    InventoryStock savedStock = inventoryStockRepository.save(stock);
                    outOfStockNotificationService.handleStockTransition(savedStock, currentQty, savedStock.getQuantity(), "INVENTORY_COUNT");
                    movementBatch = stock.getBatch();
                } else {
                    List<ProductBatch> batches = productBatchRepository.findByVariantId(variant.getId());
                    ProductBatch batch = batches.isEmpty() ? null : batches.get(0);

                    InventoryStock newStock = InventoryStock.builder()
                            .variant(variant)
                            .batch(batch)
                            .location(location)
                            .quantity(diff)
                            .build();
                    InventoryStock savedNewStock = inventoryStockRepository.save(newStock);
                    outOfStockNotificationService.handleStockTransition(savedNewStock, 0, savedNewStock.getQuantity(), "INVENTORY_COUNT");
                    movementBatch = batch;
                }
            }

            StockMovement movement = StockMovement.builder()
                    .variant(variant)
                    .batch(movementBatch)
                    .location(location)
                    .type("ADJUSTMENT")
                    .quantity(diff)
                    .referenceType("inventory_count")
                    .referenceId(count.getId().longValue())
                    .notes("Kiểm kê " + count.getCode() + ": chênh lệch " + diff
                            + (item.getReason() != null ? " - " + item.getReason() : ""))
                    .build();
            stockMovementRepository.save(movement);
        }
    }

    private void setLocation(InventoryCount count, Integer locationId) {
        if (locationId != null) {
            Location location = locationRepository.findById(locationId)
                    .orElseThrow(() -> new RuntimeException("Vi tri khong ton tai."));
            count.setLocation(location);
        }
    }

    private void calculateTotals(InventoryCount count, List<InventoryCountItemRequest> items) {
        if (items == null || items.isEmpty()) {
            count.setTotalShortageValue(BigDecimal.ZERO);
            count.setTotalOverageValue(BigDecimal.ZERO);
            count.setTotalDifferenceValue(BigDecimal.ZERO);
            return;
        }

        BigDecimal shortage = BigDecimal.ZERO;
        BigDecimal overage = BigDecimal.ZERO;

        for (InventoryCountItemRequest item : items) {
            if (item.getDifferenceValue() != null) {
                BigDecimal diff = item.getDifferenceValue();
                if (diff.compareTo(BigDecimal.ZERO) < 0) {
                    shortage = shortage.add(diff.abs());
                } else if (diff.compareTo(BigDecimal.ZERO) > 0) {
                    overage = overage.add(diff);
                }
            }
        }

        count.setTotalShortageValue(shortage);
        count.setTotalOverageValue(overage);
        count.setTotalDifferenceValue(overage.subtract(shortage));
    }

    private void saveItems(InventoryCount count, List<InventoryCountItemRequest> items) {
        if (items == null) return;

        for (InventoryCountItemRequest req : items) {
            if (req.getActualQuantity() == null) continue; // skip uncounted items

            if (req.getVariantId() == null) {
                throw InventoryCountException.variantIdRequired();
            }

            InventoryCountItem item = InventoryCountItem.builder()
                    .inventoryCount(count)
                    .productId(req.getProductId())
                    .variantId(req.getVariantId())
                    .systemQuantity(req.getSystemQuantity())
                    .actualQuantity(req.getActualQuantity())
                    .differenceQuantity(req.getDifferenceQuantity())
                    .differenceValue(req.getDifferenceValue())
                    .reason(req.getReason())
                    .build();

            itemRepository.save(item);
        }
    }

    // ─── Mappers ─────────────────────────────────────────────

    private InventoryCountResponse toListResponse(InventoryCount count) {
        return InventoryCountResponse.builder()
                .id(count.getId())
                .code(count.getCode())
                .status(count.getStatus())
                .locationId(count.getLocation() != null ? count.getLocation().getId() : null)
                .locationName(count.getLocation() != null ? count.getLocation().getName() : "")
                .notes(count.getNotes())
                .rejectionReason(count.getRejectionReason())
                .totalShortageValue(count.getTotalShortageValue())
                .totalOverageValue(count.getTotalOverageValue())
                .totalDifferenceValue(count.getTotalDifferenceValue())
                .createdBy(count.getCreatedBy())
                .confirmedBy(count.getConfirmedBy())
                .createdAt(count.getCreatedAt())
                .confirmedAt(count.getConfirmedAt())
                .build();
    }

    private InventoryCountResponse toDetailResponse(InventoryCount count) {
        InventoryCountResponse response = toListResponse(count);

        List<InventoryCountItem> items = itemRepository.findByInventoryCountId(count.getId());
        List<InventoryCountItemResponse> itemResponses = items.stream()
                .map(item -> InventoryCountItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .variantId(item.getVariantId())
                        .systemQuantity(item.getSystemQuantity())
                        .actualQuantity(item.getActualQuantity())
                        .differenceQuantity(item.getDifferenceQuantity())
                        .differenceValue(item.getDifferenceValue())
                        .reason(item.getReason())
                        .build())
                .collect(Collectors.toList());

        response.setItems(itemResponses);
        return response;
    }
}

