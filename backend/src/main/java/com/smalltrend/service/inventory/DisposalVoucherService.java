package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.disposal.*;
import com.smalltrend.entity.*;
import com.smalltrend.entity.enums.*;
import com.smalltrend.repository.*;
import com.smalltrend.validation.inventory.disposal.DisposalVoucherRequestValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DisposalVoucherService {

    private final DisposalVoucherRepository disposalVoucherRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final InventoryOutOfStockNotificationService outOfStockNotificationService;
    private final DisposalVoucherRequestValidator disposalVoucherRequestValidator;

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
        Integer locationIdInt = locationId != null ? locationId.intValue() : null;

        return productBatchRepository.findExpiredBatchesWithStockByLocation(today, locationIdInt).stream()
                .map(batch -> {
                    int qty = batch.getInventoryStocks().stream()
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
        disposalVoucherRequestValidator.validateDraftRequest(request);

        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Location location = locationRepository.findById(request.getLocationId().intValue())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        DisposalVoucher voucher;
        if (request.getId() != null) {
            voucher = disposalVoucherRepository.findById(request.getId())
                    .orElseThrow(() -> new RuntimeException("Disposal voucher not found"));

            if (voucher.getStatus() != DisposalStatus.DRAFT && voucher.getStatus() != DisposalStatus.REJECTED) {
                throw new RuntimeException("Only DRAFT or REJECTED vouchers can be edited");
            }

            voucher.getItems().clear();
        } else {
            voucher = DisposalVoucher.builder()
                    .code(generateNextCode())
                    .status(DisposalStatus.DRAFT)
                    .createdBy(user)
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        voucher.setLocation(location);
        voucher.setReasonType(DisposalReason.EXPIRED);
        voucher.setNotes(request.getNotes());

        Set<Long> seenBatchIds = new HashSet<>();
        for (DisposalVoucherItemRequest itemReq : request.getItems()) {
            if (itemReq.getBatchId() == null) {
                throw new RuntimeException("Batch ID is required");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new RuntimeException("Quantity must be greater than 0");
            }
            if (!seenBatchIds.add(itemReq.getBatchId())) {
                throw new RuntimeException("Duplicate batch in voucher items: " + itemReq.getBatchId());
            }

            ProductBatch batch = productBatchRepository.findById(itemReq.getBatchId().intValue())
                    .orElseThrow(() -> new RuntimeException("Batch not found"));

            InventoryStock stock = inventoryStockRepository.findByBatchAndLocation(batch, location)
                    .orElseThrow(() -> new RuntimeException("Stock not found for batch at selected location"));

            if (stock.getQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for batch " + batch.getBatchNumber() + ". Available: " + stock.getQuantity()
                                + ", Required: " + itemReq.getQuantity());
            }

            DisposalVoucherItem item = DisposalVoucherItem.builder()
                    .batch(batch)
                    .product(batch.getVariant().getProduct())
                    .batchCode(batch.getBatchNumber())
                    .quantity(itemReq.getQuantity())
                    .unitCost(batch.getCostPrice() != null ? batch.getCostPrice() : BigDecimal.ZERO)
                    .expiryDate(batch.getExpiryDate())
                    .build();

            voucher.addItem(item);
        }

        voucher.recalculateTotals();
        DisposalVoucher saved = disposalVoucherRepository.save(voucher);
        return toResponse(saved);
    }

    // Submit for approval
    @Transactional
    public DisposalVoucherResponse submitForApproval(Long id) {
        DisposalVoucher voucher = disposalVoucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disposal voucher not found"));

        if (voucher.getStatus() != DisposalStatus.DRAFT && voucher.getStatus() != DisposalStatus.REJECTED) {
            throw new RuntimeException("Only DRAFT or REJECTED vouchers can be submitted for approval");
        }

        if (voucher.getItems().isEmpty()) {
            throw new RuntimeException("Cannot submit voucher without items");
        }

        voucher.setStatus(DisposalStatus.PENDING);
        voucher.setRejectionReason(null);
        DisposalVoucher saved = disposalVoucherRepository.save(voucher);
        return toResponse(saved);
    }

    // Approve voucher (deduct stock)
    @Transactional
    public DisposalVoucherResponse approveVoucher(Long id, Long userId) {
        DisposalVoucher voucher = disposalVoucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disposal voucher not found"));

        if (voucher.getStatus() != DisposalStatus.PENDING) {
            throw new RuntimeException("Only PENDING vouchers can be approved");
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
        voucher.setRejectionReason(null);

        DisposalVoucher saved = disposalVoucherRepository.save(voucher);
        return toResponse(saved);
    }

    // Reject voucher
    @Transactional
    public DisposalVoucherResponse rejectVoucher(Long id, String reason) {
        DisposalVoucher voucher = disposalVoucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disposal voucher not found"));

        if (voucher.getStatus() != DisposalStatus.PENDING) {
            throw new RuntimeException("Only PENDING vouchers can be rejected");
        }

        voucher.setStatus(DisposalStatus.REJECTED);
        voucher.setRejectionReason(reason);
        DisposalVoucher saved = disposalVoucherRepository.save(voucher);
        return toResponse(saved);
    }

    // Deduct stock (with validation)
    private void deductStock(ProductBatch batch, Location location, Integer quantity) {
        InventoryStock stock = inventoryStockRepository
                .findByBatchAndLocationForUpdate(batch, location)
                .orElseThrow(() -> new RuntimeException("Stock not found for batch at location"));

        if (stock.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + stock.getQuantity() + ", Required: " + quantity);
        }

        int oldQty = stock.getQuantity() != null ? stock.getQuantity() : 0;
        stock.setQuantity(oldQty - quantity);
        InventoryStock savedStock = inventoryStockRepository.save(stock);
        outOfStockNotificationService.handleStockTransition(savedStock, oldQty, savedStock.getQuantity(), "DISPOSAL_VOUCHER");
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
                .rejectionReason(voucher.getRejectionReason())
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
