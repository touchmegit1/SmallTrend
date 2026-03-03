package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.inventorycount.*;
import com.smalltrend.dto.inventory.location.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.entity.InventoryCount;
import com.smalltrend.entity.InventoryCountItem;
import com.smalltrend.entity.Location;
import com.smalltrend.repository.InventoryCountItemRepository;
import com.smalltrend.repository.InventoryCountRepository;
import com.smalltrend.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryCountService {

    private final InventoryCountRepository countRepository;
    private final InventoryCountItemRepository itemRepository;
    private final LocationRepository locationRepository;

    // ─── LIST ────────────────────────────────────────────────

    public List<InventoryCountResponse> getAllCounts() {
        return countRepository.findAll().stream()
                .map(this::toListResponse)
                .collect(Collectors.toList());
    }

    // ─── GET BY ID ───────────────────────────────────────────

    public InventoryCountResponse getCountById(Integer id) {
        InventoryCount count = countRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu kiem kho."));
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
        InventoryCount count = countRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu kiem kho."));

        if ("CONFIRMED".equals(count.getStatus()) || "CANCELLED".equals(count.getStatus())) {
            throw new RuntimeException("Khong the cap nhat phieu da xac nhan hoac da huy.");
        }

        count.setNotes(request.getNotes());
        if (request.getStatus() != null) {
            count.setStatus(request.getStatus());
        }

        setLocation(count, request.getLocationId());
        calculateTotals(count, request.getItems());

        // Delete old items and save new ones
        itemRepository.deleteByInventoryCountId(id);
        count = countRepository.save(count);
        saveItems(count, request.getItems());

        return toDetailResponse(count);
    }

    // ─── CONFIRM ─────────────────────────────────────────────

    @Transactional
    public InventoryCountResponse confirmCount(Integer id, InventoryCountRequest request) {
        InventoryCount count = countRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu kiem kho."));

        if ("CONFIRMED".equals(count.getStatus()) || "CANCELLED".equals(count.getStatus())) {
            throw new RuntimeException("Khong the xac nhan phieu da xac nhan hoac da huy.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Phieu kiem kho phai co it nhat 1 san pham.");
        }

        count.setStatus("CONFIRMED");
        count.setNotes(request.getNotes());
        count.setConfirmedBy(1); // TODO: from auth
        count.setConfirmedAt(LocalDateTime.now());

        setLocation(count, request.getLocationId());
        calculateTotals(count, request.getItems());

        // Delete old items and save new ones
        itemRepository.deleteByInventoryCountId(id);
        count = countRepository.save(count);
        saveItems(count, request.getItems());

        // TODO: Update actual stock quantities in inventory_stock

        return toDetailResponse(count);
    }

    // ─── CONFIRM (create new + confirm) ──────────────────────

    @Transactional
    public InventoryCountResponse createAndConfirm(InventoryCountRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Phieu kiem kho phai co it nhat 1 san pham.");
        }

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

        return toDetailResponse(count);
    }

    // ─── CANCEL ──────────────────────────────────────────────

    @Transactional
    public InventoryCountResponse cancelCount(Integer id) {
        InventoryCount count = countRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu kiem kho."));

        if ("CONFIRMED".equals(count.getStatus()) || "CANCELLED".equals(count.getStatus())) {
            throw new RuntimeException("Khong the huy phieu da xac nhan hoac da huy.");
        }

        count.setStatus("CANCELLED");
        count = countRepository.save(count);
        return toListResponse(count);
    }

    // ═══════════════════════════════════════════════════════════
    //  Private Helpers
    // ═══════════════════════════════════════════════════════════

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

            InventoryCountItem item = InventoryCountItem.builder()
                    .inventoryCount(count)
                    .productId(req.getProductId())
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

