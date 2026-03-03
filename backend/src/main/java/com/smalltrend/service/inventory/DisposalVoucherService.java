package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.disposal.*;
import com.smalltrend.entity.*;
import com.smalltrend.entity.enums.*;
import com.smalltrend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DisposalVoucherService {

    private final DisposalVoucherRepository disposalVoucherRepository;
    private final DisposalVoucherItemRepository disposalVoucherItemRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    // Get all disposal vouchers
    public List<DisposalVoucherResponse> getAllDisposalVouchers() {
        return disposalVoucherRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Get disposal voucher by ID
    public DisposalVoucherResponse getDisposalVoucherById(Long id) {
        DisposalVoucher voucher = disposalVoucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disposal voucher not found"));
        return toResponse(voucher);
    }

    // Generate next code
    public String generateNextCode() {
        String prefix = "DV" + LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        Integer maxSeq = disposalVoucherRepository.findMaxSequenceForDate(prefix);
        return prefix + String.format("%03d", maxSeq + 1);
    }

    // Get expired batches
    public List<ExpiredBatchResponse> getExpiredBatches(Long locationId) {
        LocalDate today = LocalDate.now();
        
        return productBatchRepository.findAll().stream()
                .filter(batch -> batch.getExpiryDate() != null && batch.getExpiryDate().isBefore(today))
                .filter(batch -> {
                    int qty = batch.getInventoryStocks().stream()
                            .filter(stock -> locationId == null || stock.getLocation().getId().longValue() == locationId.longValue())
                            .mapToInt(InventoryStock::getQuantity)
                            .sum();
                    return qty > 0;
                })
                .map(batch -> {
                    int qty = batch.getInventoryStocks().stream()
                            .filter(stock -> locationId == null || stock.getLocation().getId().longValue() == locationId.longValue())
                            .mapToInt(InventoryStock::getQuantity)
                            .sum();
                    
                    BigDecimal unitCost = batch.getCostPrice() != null ? batch.getCostPrice() : BigDecimal.ZERO;
                    BigDecimal totalValue = unitCost.multiply(BigDecimal.valueOf(qty));
                    long daysExpired = ChronoUnit.DAYS.between(batch.getExpiryDate(), today);
                    
                    return ExpiredBatchResponse.builder()
                            .batchId(batch.getId().longValue())
                            .productId(batch.getVariant().getProduct().getId().longValue())
                            .productName(batch.getVariant().getProduct().getName())
                            .sku(batch.getVariant().getSku())
                            .batchCode(batch.getBatchNumber())
                            .availableQuantity(qty)
                            .unitCost(unitCost)
                            .totalValue(totalValue)
                            .expiryDate(batch.getExpiryDate())
                            .daysExpired((int) daysExpired)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Save draft
    @Transactional
    public DisposalVoucherResponse saveDraft(DisposalVoucherRequest request, Long userId) {
        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Location location = locationRepository.findById(request.getLocationId().intValue())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        DisposalVoucher voucher = DisposalVoucher.builder()
                .code(generateNextCode())
                .location(location)
                .status(DisposalStatus.DRAFT)
                .reasonType(DisposalReason.valueOf(request.getReasonType()))
                .notes(request.getNotes())
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .build();

        for (DisposalVoucherItemRequest itemReq : request.getItems()) {
            ProductBatch batch = productBatchRepository.findById(itemReq.getBatchId().intValue())
                    .orElseThrow(() -> new RuntimeException("Batch not found"));
            
            DisposalVoucherItem item = DisposalVoucherItem.builder()
                    .batch(batch)
                    .product(batch.getVariant().getProduct())
                    .batchCode(batch.getBatchNumber())
                    .quantity(itemReq.getQuantity())
                    .unitCost(batch.getCostPrice())
                    .expiryDate(batch.getExpiryDate())
                    .build();
            
            voucher.addItem(item);
        }

        voucher.recalculateTotals();
        DisposalVoucher saved = disposalVoucherRepository.save(voucher);
        return toResponse(saved);
    }

    // Confirm voucher (deduct stock)
    @Transactional
    public DisposalVoucherResponse confirmVoucher(Long id, Long userId) {
        DisposalVoucher voucher = disposalVoucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disposal voucher not found"));

        if (voucher.getStatus() != DisposalStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT vouchers can be confirmed");
        }

        if (voucher.getItems().isEmpty()) {
            throw new RuntimeException("Cannot confirm voucher without items");
        }

        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Deduct stock for each item
        for (DisposalVoucherItem item : voucher.getItems()) {
            deductStock(item.getBatch(), voucher.getLocation(), item.getQuantity());
        }

        voucher.setStatus(DisposalStatus.CONFIRMED);
        voucher.setConfirmedBy(user);
        voucher.setConfirmedAt(LocalDateTime.now());

        DisposalVoucher saved = disposalVoucherRepository.save(voucher);
        return toResponse(saved);
    }

    // Cancel voucher
    @Transactional
    public DisposalVoucherResponse cancelVoucher(Long id) {
        DisposalVoucher voucher = disposalVoucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disposal voucher not found"));

        if (voucher.getStatus() == DisposalStatus.CONFIRMED) {
            throw new RuntimeException("Cannot cancel confirmed voucher");
        }

        voucher.setStatus(DisposalStatus.CANCELLED);
        DisposalVoucher saved = disposalVoucherRepository.save(voucher);
        return toResponse(saved);
    }

    // Deduct stock (with validation)
    private void deductStock(ProductBatch batch, Location location, Integer quantity) {
        InventoryStock stock = inventoryStockRepository
                .findByVariantAndLocation(batch.getVariant(), location)
                .orElseThrow(() -> new RuntimeException("Stock not found for batch at location"));

        if (stock.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + stock.getQuantity() + ", Required: " + quantity);
        }

        stock.setQuantity(stock.getQuantity() - quantity);
        inventoryStockRepository.save(stock);
    }

    // Convert to response
    private DisposalVoucherResponse toResponse(DisposalVoucher voucher) {
        return DisposalVoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .locationId(voucher.getLocation().getId().longValue())
                .locationName(voucher.getLocation().getName())
                .status(voucher.getStatus().name())
                .reasonType(voucher.getReasonType().name())
                .notes(voucher.getNotes())
                .totalItems(voucher.getTotalItems())
                .totalQuantity(voucher.getTotalQuantity())
                .totalValue(voucher.getTotalValue())
                .createdBy(voucher.getCreatedBy().getId().longValue())
                .createdByName(voucher.getCreatedBy().getFullName())
                .createdAt(voucher.getCreatedAt())
                .confirmedBy(voucher.getConfirmedBy() != null ? voucher.getConfirmedBy().getId().longValue() : null)
                .confirmedByName(voucher.getConfirmedBy() != null ? voucher.getConfirmedBy().getFullName() : null)
                .confirmedAt(voucher.getConfirmedAt())
                .items(voucher.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()))
                .build();
    }

    private DisposalVoucherItemResponse toItemResponse(DisposalVoucherItem item) {
        return DisposalVoucherItemResponse.builder()
                .id(item.getId())
                .batchId(item.getBatch().getId().longValue())
                .productId(item.getProduct().getId().longValue())
                .productName(item.getProduct().getName())
                .batchCode(item.getBatchCode())
                .quantity(item.getQuantity())
                .unitCost(item.getUnitCost())
                .totalCost(item.getTotalCost())
                .expiryDate(item.getExpiryDate())
                .build();
    }
}
