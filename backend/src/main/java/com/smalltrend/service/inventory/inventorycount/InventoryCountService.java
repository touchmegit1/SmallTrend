package com.smalltrend.service.inventory.inventorycount;

import com.smalltrend.dto.inventory.inventorycount.*;
import com.smalltrend.entity.InventoryCount;
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

import java.util.List;
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

        // Cập nhật tồn kho thực tế
        adjustStock(count);

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

        // Cập nhật tồn kho thực tế
        adjustStock(count);

        return toDetailResponse(count);
    }

    // ─── SUBMIT FOR APPROVAL ─────────────────────────────────

    @Transactional
    public InventoryCountResponse submitForApproval(Integer id, InventoryCountRequest request) {
        InventoryCount count = countRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu kiem kho."));

        if (!"DRAFT".equals(count.getStatus()) && !"COUNTING".equals(count.getStatus())) {
            throw new RuntimeException("Chi co the gui duyet phieu nhap hoac dang kiem.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Phieu kiem kho phai co it nhat 1 san pham.");
        }

        if (request.getLocationId() == null) {
            throw new RuntimeException("Vui long chon vi tri can kiem kho truoc khi gui duyet.");
        }

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
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Phieu kiem kho phai co it nhat 1 san pham.");
        }

        if (request.getLocationId() == null) {
            throw new RuntimeException("Vui long chon vi tri can kiem kho truoc khi gui duyet.");
        }

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
        InventoryCount count = countRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu kiem kho."));

        if (!"PENDING".equals(count.getStatus())) {
            throw new RuntimeException("Chi co the duyet phieu dang cho duyet.");
        }

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
        InventoryCount count = countRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay phieu kiem kho."));

        if (!"PENDING".equals(count.getStatus())) {
            throw new RuntimeException("Chi co the tu choi phieu dang cho duyet.");
        }

        count.setStatus("REJECTED");
        count.setRejectionReason(rejectionReason);

        count = countRepository.save(count);
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
    //  7. Xóa phiếu (Delete)
    // ═══════════════════════════════════════════════════════════

    /** Xóa phiếu kiểm kê (chỉ cho phép xóa DRAFT hoặc CANCELLED) */
    @Transactional
    public void deleteCount(Integer id) {
        InventoryCount count = countRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu kiểm kho."));

        if ("CONFIRMED".equals(count.getStatus())) {
            throw new RuntimeException("Không thể xóa phiếu đã xác nhận.");
        }

        // Xóa items trước (do foreign key constraint)
        itemRepository.deleteByInventoryCountId(id);
        countRepository.delete(count);
    }

    // ═══════════════════════════════════════════════════════════
    //  Private Helpers
    // ═══════════════════════════════════════════════════════════

    /**
     * Điều chỉnh tồn kho dựa trên kết quả kiểm kê.
     * Với mỗi item trong phiếu kiểm kê, tìm tất cả InventoryStock
     * tại location tương ứng cho product đó và điều chỉnh số lượng.
     */
    private void adjustStock(InventoryCount count) {
        List<InventoryCountItem> items = itemRepository.findByInventoryCountId(count.getId());
        Location location = count.getLocation();

        for (InventoryCountItem item : items) {
            int diff = item.getDifferenceQuantity() != null ? item.getDifferenceQuantity() : 0;
            if (diff == 0) continue; // Không có chênh lệch, bỏ qua

            // Tìm tất cả variants của product này
            List<ProductVariant> variants = productVariantRepository.findByProductId(item.getProductId());
            if (variants.isEmpty()) continue;

            // Lấy variant đầu tiên để ghi StockMovement
            ProductVariant variant = variants.get(0);

            // Tìm tất cả stock records của variant tại location
            List<InventoryStock> stocks;
            if (location != null) {
                stocks = inventoryStockRepository.findByLocationIdWithProduct(location.getId())
                        .stream()
                        .filter(s -> s.getVariant().getId().equals(variant.getId()))
                        .collect(Collectors.toList());
            } else {
                stocks = inventoryStockRepository.findByVariantId(variant.getId());
            }

            if (!stocks.isEmpty()) {
                // Điều chỉnh stock record đầu tiên tìm được
                InventoryStock stock = stocks.get(0);
                int newQty = stock.getQuantity() + diff;
                if (newQty < 0) newQty = 0;
                stock.setQuantity(newQty);
                inventoryStockRepository.save(stock);

                // Tạo StockMovement để ghi lại
                StockMovement movement = StockMovement.builder()
                        .variant(variant)
                        .batch(stock.getBatch())
                        .location(location)
                        .type("ADJUSTMENT")
                        .quantity(diff)
                        .referenceType("inventory_count")
                        .referenceId(count.getId().longValue())
                        .notes("Kiểm kê " + count.getCode() + ": chênh lệch " + diff
                                + (item.getReason() != null ? " - " + item.getReason() : ""))
                        .build();
                stockMovementRepository.save(movement);
            } else if (diff > 0) {
                // Nếu chưa có stock record nào (số lượng = 0 trong hệ thống, nhưng thực tế có)
                // Lấy một batch bất kỳ của sản phẩm hoặc tạo mới tuỳ logic, ở đây lấy batch đầu tiên (nếu có)
                List<ProductBatch> batches = productBatchRepository.findByVariantId(variant.getId());
                ProductBatch batch = batches.isEmpty() ? null : batches.get(0);

                InventoryStock newStock = InventoryStock.builder()
                        .variant(variant)
                        .batch(batch)
                        .location(location)
                        .quantity(diff)
                        .build();
                inventoryStockRepository.save(newStock);

                 StockMovement movement = StockMovement.builder()
                        .variant(variant)
                        .batch(batch)
                        .location(location)
                        .type("ADJUSTMENT")
                        .quantity(diff)
                        .referenceType("inventory_count")
                        .referenceId(count.getId().longValue())
                        .notes("Kiểm kê " + count.getCode() + ": thêm mới " + diff
                                + (item.getReason() != null ? " - " + item.getReason() : ""))
                        .build();
                stockMovementRepository.save(movement);
            }
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

