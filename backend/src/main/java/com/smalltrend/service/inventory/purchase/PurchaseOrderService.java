package com.smalltrend.service.inventory.purchase;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.inventory.purchase.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.entity.*;
import com.smalltrend.entity.enums.PurchaseOrderStatus;
import com.smalltrend.repository.*;
import com.smalltrend.service.inventory.shared.InventoryManagerNotificationService;
import com.smalltrend.service.inventory.shared.InventoryStockService;
import com.smalltrend.service.products.VariantPriceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.math.RoundingMode;
import java.util.concurrent.CompletableFuture;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierContractRepository supplierContractRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final LocationRepository locationRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UnitConversionRepository unitConversionRepository;
    private final VariantPriceService variantPriceService;
    private final InventoryManagerNotificationService inventoryManagerNotificationService;
    private final InventoryStockService inventoryStockService;

    // ═══════════════════════════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════════════════════════
    // ─── List All Purchase Orders ────────────────────────────
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllOrders() {
        return purchaseOrderRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(
                        PurchaseOrder::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(this::toListResponse)
                .collect(Collectors.toList());
    }

    // ─── Get Single Order Detail ─────────────────────────────
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getOrderById(Integer id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + id));
        return toDetailResponse(order);
    }

    @Transactional(readOnly = true)
    public MessageResponse notifyManagers(Integer orderId, NotifyManagerEmailRequest request) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        int recipientCount = inventoryManagerNotificationService.notifyManagers(order, request);
        return new MessageResponse("Đã gửi thông báo cho " + recipientCount + " quản lý.");
    }

    private void notifyManagersOnShortage(PurchaseOrder order) {
        CompletableFuture.runAsync(() -> {
            try {
                String orderNumber = order != null && order.getOrderNumber() != null ? order.getOrderNumber() : "N/A";
                String shortageReason = order != null && order.getShortageReason() != null
                        ? order.getShortageReason()
                        : "Không có";

                NotifyManagerEmailRequest request = NotifyManagerEmailRequest.builder()
                        .subject("[PO thiếu hàng] " + orderNumber)
                        .message("Phiếu nhập " + orderNumber + " đang thiếu hàng.\nLý do thiếu: " + shortageReason)
                        .build();

                int recipientCount = inventoryManagerNotificationService.notifyManagers(order, request);
                log.info("Đã tự động gửi thông báo thiếu hàng cho {} quản lý của PO {}.", recipientCount, orderNumber);
            } catch (Exception ex) {
                String orderNumber = order != null && order.getOrderNumber() != null ? order.getOrderNumber() : "N/A";
                log.warn("Không thể tự động gửi email thiếu hàng cho PO {}: {}", orderNumber, ex.getMessage());
            }
        });
    }

    private void notifyManagersOnPendingApproval(PurchaseOrder order) {
        CompletableFuture.runAsync(() -> {
            try {
                String orderNumber = order != null && order.getOrderNumber() != null ? order.getOrderNumber() : "N/A";
                NotifyManagerEmailRequest request = NotifyManagerEmailRequest.builder()
                        .subject("[PO chờ duyệt] " + orderNumber)
                        .message("Phiếu nhập " + orderNumber + " đã được gửi yêu cầu nhập kho và đang chờ quản lý duyệt.")
                        .build();

                int recipientCount = inventoryManagerNotificationService.notifyManagers(order, request);
                log.info("Đã tự động gửi thông báo chờ duyệt cho {} quản lý của PO {}.", recipientCount, orderNumber);
            } catch (Exception ex) {
                String orderNumber = order != null && order.getOrderNumber() != null ? order.getOrderNumber() : "N/A";
                log.warn("Không thể tự động gửi email chờ duyệt cho PO {}: {}", orderNumber, ex.getMessage());
            }
        });
    }

    // ─── Generate Next PO Code ───────────────────────────────
    public String generateNextPOCode() {
        int year = LocalDate.now().getYear();
        String prefix = "PO-" + year + "-";
        List<PurchaseOrder> allOrders = purchaseOrderRepository.findAll();
        int maxNum = 0;
        for (PurchaseOrder order : allOrders) {
            String code = order.getOrderNumber();
            if (code != null && code.startsWith(prefix)) {
                try {
                    int num = Integer.parseInt(code.substring(prefix.length()));
                    if (num > maxNum) {
                        maxNum = num;
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return prefix + String.format("%03d", maxNum + 1);
    }

    // ─── Save Draft ──────────────────────────────────────────
    @Transactional
    public PurchaseOrderResponse saveDraft(PurchaseOrderRequest request) {
        validateDraft(request);

        PurchaseOrder order = buildOrderFromRequest(request);
        boolean submitForApproval = request.getStatus() != null && "PENDING".equalsIgnoreCase(request.getStatus());
        if (submitForApproval) {
            order.setStatus(PurchaseOrderStatus.PENDING);
        } else {
            order.setStatus(PurchaseOrderStatus.DRAFT);
        }
        order.setOrderDate(LocalDate.now());

        if (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) {
            order.setOrderNumber(generateNextPOCode());
        }

        // Recalculate financials server-side
        List<PurchaseOrderItemRequest> itemRequests = request.getItems() != null ? request.getItems()
                : new ArrayList<>();
        recalculate(order, itemRequests);

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        if (!itemRequests.isEmpty()) {
            saveOrderItems(savedOrder, itemRequests);
        }

        if (submitForApproval) {
            notifyManagersOnPendingApproval(savedOrder);
        }

        return toDetailResponse(purchaseOrderRepository.findById(savedOrder.getId()).orElse(savedOrder));
    }

    // ─── Confirm New Order (create + confirm in one step) ────
    @Transactional
    public PurchaseOrderResponse confirmOrder(PurchaseOrderRequest request) {
        validateConfirm(request);

        PurchaseOrder order = buildOrderFromRequest(request);
        order.setStatus(PurchaseOrderStatus.CONFIRMED);
        order.setOrderDate(LocalDate.now());

        if (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) {
            order.setOrderNumber(generateNextPOCode());
        }

        List<PurchaseOrderItemRequest> itemRequests = request.getItems() != null ? request.getItems()
                : new ArrayList<>();
        recalculate(order, itemRequests);

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        if (!itemRequests.isEmpty()) {
            saveOrderItems(savedOrder, itemRequests);
        }

        log.info("Purchase Order {} CONFIRMED. Chờ NV kho kiểm kê.", savedOrder.getOrderNumber());
        return toDetailResponse(purchaseOrderRepository.findById(savedOrder.getId()).orElse(savedOrder));
    }

    // ─── Approve Pending Order (Manager approves) ──────────
    // Quản lý duyệt: PENDING → CONFIRMED (KHÔNG cập nhật stock)
    @Transactional
    public PurchaseOrderResponse approveOrder(Integer orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể duyệt phiếu đang chờ duyệt.");
        }

        order.setStatus(PurchaseOrderStatus.CONFIRMED);
        order.setRejectionReason(null);
        purchaseOrderRepository.save(order);

        log.info("Purchase Order {} APPROVED by Manager. Chờ NV kho kiểm kê.", order.getOrderNumber());
        return toDetailResponse(order);
    }

    // ─── Start Checking (NV kho bắt đầu kiểm kê) ───────────
    // CONFIRMED/SUPPLIER_SUPPLEMENT_PENDING → CHECKING
    @Transactional
    public PurchaseOrderResponse startChecking(Integer orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.CONFIRMED
                && order.getStatus() != PurchaseOrderStatus.SUPPLIER_SUPPLEMENT_PENDING) {
            throw new RuntimeException("Chỉ có thể bắt đầu kiểm kê phiếu đã được duyệt hoặc đang chờ NCC giao bù.");
        }

        order.setStatus(PurchaseOrderStatus.CHECKING);
        purchaseOrderRepository.save(order);

        log.info("Purchase Order {} CHECKING started.", order.getOrderNumber());
        return toDetailResponse(order);
    }

    // ─── Receive Goods (NV kho xác nhận nhập kho) ───────────
    // CHECKING → RECEIVED hoặc SHORTAGE_PENDING_APPROVAL
    @Transactional
    public PurchaseOrderResponse receiveGoods(Integer orderId, GoodsReceiptRequest receiptRequest) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.CHECKING) {
            throw new RuntimeException("Chỉ có thể nhập kho phiếu đang kiểm kê.");
        }

        Integer lockedSupplierId = order.getSupplier() != null ? order.getSupplier().getId() : null;
        Integer lockedLocationId = order.getLocationId();

        Integer effectiveSupplierId = receiptRequest.getSupplierId() != null
                ? receiptRequest.getSupplierId()
                : lockedSupplierId;
        Integer effectiveLocationId = receiptRequest.getLocationId() != null
                ? receiptRequest.getLocationId()
                : lockedLocationId;
        BigDecimal effectiveTaxPercent = receiptRequest.getTaxPercent() != null
                ? receiptRequest.getTaxPercent()
                : (order.getTaxPercent() != null ? order.getTaxPercent() : BigDecimal.ZERO);
        BigDecimal effectiveShippingFee = receiptRequest.getShippingFee() != null
                ? receiptRequest.getShippingFee()
                : (order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO);
        BigDecimal effectivePaidAmount = receiptRequest.getPaidAmount() != null
                ? receiptRequest.getPaidAmount()
                : (order.getPaidAmount() != null ? order.getPaidAmount() : BigDecimal.ZERO);
        BigDecimal effectiveDiscountAmount = receiptRequest.getDiscountAmount() != null
                ? receiptRequest.getDiscountAmount()
                : (order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO);

        if (effectiveSupplierId == null) {
            throw new RuntimeException("Nhà cung cấp là bắt buộc khi xác nhận nhập kho.");
        }
        if (effectiveLocationId == null) {
            throw new RuntimeException("Vị trí nhập kho là bắt buộc khi xác nhận nhập kho.");
        }
        if (effectiveTaxPercent.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Thuế VAT (%) không được âm.");
        }
        if (effectiveShippingFee.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Phí vận chuyển không được âm.");
        }
        if (effectivePaidAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Số tiền đã thanh toán không được âm.");
        }
        if (effectiveDiscountAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giảm giá không được âm.");
        }

        boolean hasShortage = false;
        boolean isSupplementRecheck = "REQUEST_SUPPLEMENT".equals(order.getManagerDecision());
        List<PurchaseOrderItemRequest> stockItemRequests = new ArrayList<>();
        Map<Integer, PurchaseOrderItem> orderItemById = new HashMap<>();
        if (order.getItems() != null) {
            for (PurchaseOrderItem item : order.getItems()) {
                if (item != null && item.getId() != null) {
                    orderItemById.put(item.getId(), item);
                }
            }
        }

        if (receiptRequest.getItems() != null) {
            for (GoodsReceiptRequest.GoodsReceiptItemRequest receiptItem : receiptRequest.getItems()) {
                if (receiptItem.getReceivedQuantity() == null || receiptItem.getReceivedQuantity() < 0) {
                    throw new RuntimeException("Số lượng thực nhận không hợp lệ.");
                }

                if (receiptItem.getItemId() == null) {
                    throw new RuntimeException("Thiếu mã sản phẩm trong phiếu nhập.");
                }

                PurchaseOrderItem orderItem = orderItemById.get(receiptItem.getItemId());
                if (orderItem == null) {
                    throw new RuntimeException("Không tìm thấy sản phẩm trong phiếu nhập.");
                }

                int orderedQty = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
                Integer conversionFactorValue = resolveConversionFactor(orderItem.getVariant());
                int conversionFactor = conversionFactorValue != null && conversionFactorValue > 0
                        ? conversionFactorValue
                        : 1;
                int expectedCheckingQty = orderedQty * conversionFactor;

                int previousReceivedQty = orderItem.getReceivedQuantity() != null ? orderItem.getReceivedQuantity() : 0;
                int newReceivedQty = receiptItem.getReceivedQuantity();
                if (newReceivedQty < previousReceivedQty && !isSupplementRecheck) {
                    throw new RuntimeException("Số lượng thực nhận không được nhỏ hơn số đã nhập trước đó.");
                }
                int stockQtyForReceive = isSupplementRecheck ? newReceivedQty : (newReceivedQty - previousReceivedQty);

                if (newReceivedQty < expectedCheckingQty) {
                    hasShortage = true;
                }

                if (receiptItem.getExpiryDate() != null) {
                    orderItem.setExpiryDate(receiptItem.getExpiryDate());
                }

                BigDecimal orderedEquivalentQty = BigDecimal.valueOf(newReceivedQty)
                        .divide(BigDecimal.valueOf(conversionFactor), 4, RoundingMode.HALF_UP);

                orderItem.setReceivedQuantity(newReceivedQty);
                orderItem.setUnitCost(receiptItem.getUnitCost());
                orderItem.setTotalCost(receiptItem.getUnitCost().multiply(orderedEquivalentQty));
                if (receiptItem.getNotes() != null) {
                    orderItem.setNotes(receiptItem.getNotes());
                }
                purchaseOrderItemRepository.save(orderItem);

                if (stockQtyForReceive > 0) {
                    BigDecimal stockOrderedEquivalentQty = BigDecimal.valueOf(stockQtyForReceive)
                            .divide(BigDecimal.valueOf(conversionFactor), 4, RoundingMode.HALF_UP);
                    stockItemRequests.add(PurchaseOrderItemRequest.builder()
                            .variantId(orderItem.getVariant() != null ? orderItem.getVariant().getId().intValue() : null)
                            .productId(orderItem.getVariant() != null && orderItem.getVariant().getProduct() != null
                                    ? orderItem.getVariant().getProduct().getId().intValue() : null)
                            .quantity(stockQtyForReceive)
                            .unitCost(receiptItem.getUnitCost())
                            .totalCost(receiptItem.getUnitCost().multiply(stockOrderedEquivalentQty))
                            .expiryDate(orderItem.getExpiryDate())
                            .build());
                }
            }
        }

        if (stockItemRequests.isEmpty() && receiptRequest.getItems() != null && !receiptRequest.getItems().isEmpty()) {
            throw new RuntimeException("Không có số lượng mới để nhập kho.");
        }

        if (receiptRequest.getShortageReason() != null && !receiptRequest.getShortageReason().isBlank()) {
            hasShortage = true;
        }

        if (order.getItems() != null) {
            for (PurchaseOrderItem item : order.getItems()) {
                if (item == null) {
                    continue;
                }
                int orderedQty = item.getQuantity() != null ? item.getQuantity() : 0;
                Integer conversionFactorValue = resolveConversionFactor(item.getVariant());
                int conversionFactor = conversionFactorValue != null && conversionFactorValue > 0
                        ? conversionFactorValue
                        : 1;
                int expectedCheckingQty = orderedQty * conversionFactor;
                int receivedQty = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;

                if (receivedQty < expectedCheckingQty) {
                    hasShortage = true;
                    break;
                }
            }
        }

        Supplier supplier = supplierRepository.findById(effectiveSupplierId)
                .orElseThrow(() -> new RuntimeException("Nhà cung cấp không tồn tại."));
        order.setSupplier(supplier);
        order.setLocationId(effectiveLocationId);

        BigDecimal subtotal = order.getItems().stream()
                .map(item -> {
                    int receivedQty = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
                    BigDecimal unitCost = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;
                    Integer factorValue = resolveConversionFactor(item.getVariant());
                    int factor = factorValue != null && factorValue > 0 ? factorValue : 1;
                    BigDecimal orderedEquivalentQty = BigDecimal.valueOf(receivedQty)
                            .divide(BigDecimal.valueOf(factor), 4, RoundingMode.HALF_UP);
                    return unitCost.multiply(orderedEquivalentQty);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discountAmount = effectiveDiscountAmount;
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        if (afterDiscount.compareTo(BigDecimal.ZERO) < 0) {
            afterDiscount = BigDecimal.ZERO;
        }
        BigDecimal taxPercent = effectiveTaxPercent;
        BigDecimal taxAmount = afterDiscount.multiply(taxPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal shippingFee = effectiveShippingFee;
        BigDecimal totalAmount = afterDiscount.add(taxAmount).add(shippingFee)
                .setScale(2, RoundingMode.HALF_UP);

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setTaxPercent(taxPercent);
        order.setTaxAmount(taxAmount);
        order.setShippingFee(shippingFee);
        order.setPaidAmount(effectivePaidAmount);
        order.setTotalAmount(totalAmount);
        order.setActualDeliveryDate(LocalDate.now());
        if (receiptRequest.getNotes() != null) {
            order.setNotes(receiptRequest.getNotes());
        }

        List<SyncedPurchasePriceItemResponse> syncedPurchasePriceItems = new ArrayList<>();
        int syncedPurchasePriceCount = 0;
        LocalDateTime syncedPurchasePriceAt = null;

        if (hasShortage) {
            if (receiptRequest.getShortageReason() == null || receiptRequest.getShortageReason().isBlank()) {
                throw new RuntimeException("Vui lòng nhập lý do thiếu hàng trước khi gửi quản lý.");
            }
            order.setShortageReason(receiptRequest.getShortageReason().trim());
            order.setShortageSubmittedAt(LocalDateTime.now());
            order.setManagerDecision("REQUEST_SUPPLEMENT");
            order.setManagerDecisionNote(null);
            order.setManagerDecidedAt(null);
            order.setStatus(PurchaseOrderStatus.SHORTAGE_PENDING_APPROVAL);
            notifyManagersOnShortage(order);
        } else {
            if (!stockItemRequests.isEmpty()) {
                updateStock(order, stockItemRequests, false);
            }
            syncedPurchasePriceItems = syncPurchasePrices(order);
            syncedPurchasePriceCount = syncedPurchasePriceItems.size();
            syncedPurchasePriceAt = syncedPurchasePriceCount > 0 ? LocalDateTime.now() : null;
            order.setStatus(PurchaseOrderStatus.RECEIVED);
            order.setShortageReason(null);
            order.setShortageSubmittedAt(null);
            order.setManagerDecision(null);
            order.setManagerDecisionNote(null);
            order.setManagerDecidedAt(null);
        }
        purchaseOrderRepository.save(order);

        log.info("Purchase Order {} receive processed. Status={}, stock delta updated.",
                order.getOrderNumber(),
                order.getStatus());

        PurchaseOrderResponse response = toDetailResponse(order);
        response.setSyncedPurchasePriceCount(syncedPurchasePriceCount);
        response.setSyncedPurchasePriceAt(syncedPurchasePriceAt);
        response.setSyncedPurchasePriceItems(syncedPurchasePriceItems);
        return response;
    }

    @Transactional
    public PurchaseOrderResponse closeShortage(Integer orderId, String managerDecisionNote) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.SHORTAGE_PENDING_APPROVAL) {
            throw new RuntimeException("Chỉ có thể chốt thiếu khi phiếu đang chờ quản lý xử lý thiếu hàng.");
        }

        List<PurchaseOrderItemRequest> stockItemRequests = (order.getItems() == null ? List.<PurchaseOrderItemRequest>of() : order.getItems().stream()
                .filter(Objects::nonNull)
                .map(item -> PurchaseOrderItemRequest.builder()
                .variantId(item.getVariant() != null ? item.getVariant().getId().intValue() : null)
                .productId(item.getVariant() != null && item.getVariant().getProduct() != null
                        ? item.getVariant().getProduct().getId().intValue() : null)
                .quantity(item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0)
                .unitCost(item.getUnitCost())
                .totalCost(item.getTotalCost())
                .expiryDate(item.getExpiryDate())
                .build())
                .filter(req -> req.getQuantity() != null && req.getQuantity() > 0)
                .toList());

        if (stockItemRequests.isEmpty()) {
            throw new RuntimeException("Không có số lượng thực nhận để chốt thiếu.");
        }

        updateStock(order, stockItemRequests, false);

        order.setManagerDecision("CLOSE_SHORTAGE");
        order.setManagerDecisionNote(managerDecisionNote);
        order.setManagerDecidedAt(LocalDateTime.now());
        order.setStatus(PurchaseOrderStatus.RECEIVED);
        purchaseOrderRepository.save(order);

        List<SyncedPurchasePriceItemResponse> syncedPurchasePriceItems = syncPurchasePrices(order);
        int syncedPurchasePriceCount = syncedPurchasePriceItems.size();
        LocalDateTime syncedPurchasePriceAt = syncedPurchasePriceCount > 0 ? LocalDateTime.now() : null;

        log.info("Purchase Order {} shortage closed by manager. Stock updated.", order.getOrderNumber());
        PurchaseOrderResponse response = toDetailResponse(order);
        response.setSyncedPurchasePriceCount(syncedPurchasePriceCount);
        response.setSyncedPurchasePriceAt(syncedPurchasePriceAt);
        response.setSyncedPurchasePriceItems(syncedPurchasePriceItems);
        return response;
    }

    @Transactional
    public PurchaseOrderResponse requestSupplierSupplement(Integer orderId, String managerDecisionNote) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.SHORTAGE_PENDING_APPROVAL) {
            throw new RuntimeException("Chỉ có thể yêu cầu NCC giao bù khi phiếu đang chờ quản lý xử lý thiếu hàng.");
        }

        order.setManagerDecision("REQUEST_SUPPLEMENT");
        order.setManagerDecisionNote(managerDecisionNote);
        order.setManagerDecidedAt(LocalDateTime.now());
        order.setStatus(PurchaseOrderStatus.SUPPLIER_SUPPLEMENT_PENDING);
        purchaseOrderRepository.save(order);

        log.info("Purchase Order {} moved to SUPPLIER_SUPPLEMENT_PENDING.", order.getOrderNumber());
        return toDetailResponse(order);
    }

    @Transactional
    public PurchaseOrderResponse rejectShortage(Integer orderId, String reason) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.SHORTAGE_PENDING_APPROVAL) {
            throw new RuntimeException("Chỉ có thể từ chối nhập hàng khi phiếu đang chờ quản lý xử lý thiếu hàng.");
        }

        if (reason == null || reason.isBlank()) {
            throw new RuntimeException("Lý do từ chối nhập hàng là bắt buộc.");
        }

        order.setManagerDecision("REJECT_SHORTAGE");
        order.setManagerDecisionNote(reason.trim());
        order.setManagerDecidedAt(LocalDateTime.now());
        order.setStatus(PurchaseOrderStatus.REJECTED);
        order.setRejectionReason(reason.trim());
        purchaseOrderRepository.save(order);

        log.info("Purchase Order {} shortage rejected by manager. Reason: {}", order.getOrderNumber(), reason);
        return toDetailResponse(order);
    }

    // ─── Confirm Existing Draft ──────────────────────────────
    @Transactional
    public PurchaseOrderResponse confirmExistingOrder(Integer orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT && order.getStatus() != PurchaseOrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể xác nhận phiếu ở trạng thái Phiếu tạm hoặc Chờ duyệt.");
        }

        if (order.getSupplier() == null) {
            throw new RuntimeException("Vui lòng chọn nhà cung cấp trước khi xác nhận.");
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("Phiếu nhập phải có ít nhất 1 sản phẩm.");
        }

        order.setStatus(PurchaseOrderStatus.CONFIRMED);
        purchaseOrderRepository.save(order);

        log.info("Existing Draft {} CONFIRMED. Chờ NV kho kiểm kê.", order.getOrderNumber());
        return toDetailResponse(order);
    }

    // ─── Update Order ──────────────────────────────────────────
    @Transactional
    public PurchaseOrderResponse updateOrder(Integer id, PurchaseOrderRequest request) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + id));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT && order.getStatus() != PurchaseOrderStatus.REJECTED) {
            throw new RuntimeException("Chỉ có thể cập nhật phiếu ở trạng thái Phiếu tạm hoặc Từ chối.");
        }

        validateDraft(request);

        boolean submitForApproval = request.getStatus() != null && "PENDING".equalsIgnoreCase(request.getStatus());
        if (order.getStatus() == PurchaseOrderStatus.REJECTED
                && submitForApproval
                && !hasResubmissionChanges(order, request)) {
            throw new RuntimeException("Phiếu bị từ chối phải được chỉnh sửa trước khi gửi duyệt lại.");
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Nhà cung cấp không tồn tại."));
            order.setSupplier(supplier);
        } else {
            order.setSupplier(null);
        }

        // Cập nhật contract nếu có
        if (request.getContractId() != null) {
            SupplierContract contract = supplierContractRepository.findById(request.getContractId())
                    .orElseThrow(() -> new RuntimeException("Hợp đồng không tồn tại."));
            order.setContract(contract);
        }

        order.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        order.setLocationId(request.getLocationId());
        order.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        order.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        order.setTaxPercent(request.getTaxPercent() != null ? request.getTaxPercent() : BigDecimal.ZERO);
        order.setShippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO);
        order.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO);
        order.setNotes(request.getNotes());
        order.setRejectionReason(null); // Clear rejection reason upon update

        // Update status based on request (DRAFT or PENDING)
        if (request.getStatus() != null && "PENDING".equalsIgnoreCase(request.getStatus())) {
            order.setStatus(PurchaseOrderStatus.PENDING);
        } else {
            order.setStatus(PurchaseOrderStatus.DRAFT);
        }

        purchaseOrderItemRepository.deleteAll(order.getItems());
        order.getItems().clear();

        List<PurchaseOrderItemRequest> itemRequests = request.getItems() != null ? request.getItems() : new ArrayList<>();
        recalculate(order, itemRequests);

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);
        if (!itemRequests.isEmpty()) {
            saveOrderItems(savedOrder, itemRequests);
        }

        if (submitForApproval) {
            notifyManagersOnPendingApproval(savedOrder);
        }

        return toDetailResponse(purchaseOrderRepository.findById(savedOrder.getId()).orElse(savedOrder));
    }

    // ─── Reject Order ────────────────────────────────────────
    @Transactional
    public PurchaseOrderResponse rejectOrder(Integer id, String reason) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + id));

        if (order.getStatus() != PurchaseOrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể từ chối phiếu đang chờ duyệt.");
        }

        order.setStatus(PurchaseOrderStatus.REJECTED);
        order.setRejectionReason(reason);
        purchaseOrderRepository.save(order);

        log.info("Purchase Order {} REJECTED. Reason: {}", order.getOrderNumber(), reason);
        return toDetailResponse(order);
    }

    // ─── Cancel Order ────────────────────────────────────────
    @Transactional
    public PurchaseOrderResponse cancelOrder(Integer orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new RuntimeException("Chỉ có thể hủy phiếu ở trạng thái Phiếu tạm.");
        }

        order.setStatus(PurchaseOrderStatus.CANCELLED);
        purchaseOrderRepository.save(order);

        log.info("Purchase Order {} CANCELLED.", order.getOrderNumber());
        return toDetailResponse(order);
    }

    // ─── Delete Draft Order ──────────────────────────────────
    @Transactional
    public void deleteOrder(Integer orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT && order.getStatus() != PurchaseOrderStatus.REJECTED) {
            throw new RuntimeException("Chỉ có thể xóa phiếu ở trạng thái Phiếu tạm hoặc Từ chối.");
        }

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            purchaseOrderItemRepository.deleteAll(order.getItems());
        }
        purchaseOrderRepository.delete(order);

        log.info("Purchase Order {} DELETED.", order.getOrderNumber());
    }

    // ─── Get All Suppliers ───────────────────────────────────
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(s -> SupplierResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .contactInfo(s.getContactPerson())
                .build())
                .collect(Collectors.toList());
    }

    // ─── Get Active Contracts By Supplier ─────────────────────
    public List<ContractResponse> getContractsBySupplier(Integer supplierId) {
        return supplierContractRepository.findBySupplierId(supplierId).stream()
                .map(c -> ContractResponse.builder()
                .id(c.getId())
                .contractNumber(c.getContractNumber())
                .title(c.getTitle())
                .status(c.getStatus() != null ? c.getStatus().name() : "DRAFT")
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .totalValue(c.getTotalValue())
                .build())
                .collect(Collectors.toList());
    }

    // ─── Get All Products (with variant info, stock quantity, unit) ─
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productVariantRepository.findAll().stream()
                .map(v -> {
                    Product p = v.getProduct();
                    ProductResponse.ProductResponseBuilder builder = ProductResponse.builder()
                            .id(v.getId() != null ? v.getId().intValue() : null)
                            .productId(p != null && p.getId() != null ? p.getId().intValue() : null)
                            .variantId(v.getId() != null ? v.getId().intValue() : null)
                            .name(p != null ? p.getName() : "Sản phẩm")
                            .imageUrl(v.getImageUrl() != null ? v.getImageUrl() : (p != null ? p.getImageUrl() : null))
                            .attributes(v.getAttributes())
                            .sku(v.getSku())
                            .purchasePrice(v.getSellPrice());

                    if (v.getUnit() != null) {
                        builder.unit(v.getUnit().getName());
                    }

                    int totalStock = 0;
                    if (v.getInventoryStocks() != null) {
                        for (InventoryStock stock : v.getInventoryStocks()) {
                            if (stock.getQuantity() != null) {
                                totalStock += stock.getQuantity();
                            }
                        }
                    }

                    Integer conversionFactorValue = resolveConversionFactor(v);
                    int conversionFactor = conversionFactorValue != null && conversionFactorValue > 0
                            ? conversionFactorValue
                            : 1;
                    ProductVariant baseVariant = resolveBaseVariant(v);
                    Integer baseVariantId = baseVariant != null ? baseVariant.getId() : null;
                    Integer currentVariantId = v.getId();
                    if (conversionFactor > 1
                            && baseVariantId != null
                            && currentVariantId != null
                            && !baseVariantId.equals(currentVariantId)) {
                        int baseStockQty = inventoryStockRepository.findByVariantId(baseVariantId).stream()
                                .mapToInt(stock -> stock.getQuantity() != null ? stock.getQuantity() : 0)
                                .sum();
                        totalStock = baseStockQty / conversionFactor;
                    }

                    builder.stockQuantity(totalStock);
                    return builder.build();
                })
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════
    // Private helpers
    // ═══════════════════════════════════════════════════════════
    // ─── Build Order from Request ────────────────────────────
    private PurchaseOrder buildOrderFromRequest(PurchaseOrderRequest request) {
        PurchaseOrder order = PurchaseOrder.builder()
                .orderNumber(request.getOrderNumber())
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .subtotal(request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO)
                .taxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO)
                .taxPercent(request.getTaxPercent() != null ? request.getTaxPercent() : BigDecimal.ZERO)
                .totalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO)
                .shippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO)
                .paidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO)
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .locationId(request.getLocationId())
                .notes(request.getNotes())
                .build();
        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Nhà cung cấp không tồn tại."));
            order.setSupplier(supplier);
        }

        // Liên kết contract nếu có
        if (request.getContractId() != null) {
            SupplierContract contract = supplierContractRepository.findById(request.getContractId())
                    .orElseThrow(() -> new RuntimeException("Hợp đồng không tồn tại."));
            order.setContract(contract);
        }

        return order;
    }

    // ─── Recalculate Financials Server-side ───────────────────
    private void recalculate(PurchaseOrder order, List<PurchaseOrderItemRequest> items) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (PurchaseOrderItemRequest item : items) {
            BigDecimal unitCost = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;
            int qty = item.getQuantity() != null ? item.getQuantity() : 0;
            BigDecimal lineTotal = unitCost.multiply(BigDecimal.valueOf(qty));
            if (lineTotal.compareTo(BigDecimal.ZERO) < 0) {
                lineTotal = BigDecimal.ZERO;
            }
            subtotal = subtotal.add(lineTotal);
        }
        order.setSubtotal(subtotal);

        BigDecimal afterDiscount = subtotal.subtract(
                order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO);
        if (afterDiscount.compareTo(BigDecimal.ZERO) < 0) {
            afterDiscount = BigDecimal.ZERO;
        }

        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        order.setTaxAmount(taxAmount);

        BigDecimal shippingFee = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;

        BigDecimal total = afterDiscount.add(taxAmount).add(shippingFee);
        order.setTotalAmount(total);
    }

    // ─── Save Order Items ────────────────────────────────────
    private void saveOrderItems(PurchaseOrder savedOrder, List<PurchaseOrderItemRequest> itemRequests) {
        for (PurchaseOrderItemRequest itemReq : itemRequests) {
            BigDecimal unitCost = itemReq.getUnitCost() != null ? itemReq.getUnitCost() : BigDecimal.ZERO;
            int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 0;
            BigDecimal totalCost = unitCost.multiply(BigDecimal.valueOf(qty));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(savedOrder)
                    .quantity(qty)
                    .unitCost(unitCost)
                    .totalCost(totalCost)
                    .expiryDate(itemReq.getExpiryDate())
                    .notes(itemReq.getNotes())
                    .build();

            // Resolve product variant
            if (itemReq.getVariantId() != null) {
                ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                        .orElseThrow(() -> new RuntimeException(
                        "Phiên bản sản phẩm không tồn tại: " + itemReq.getVariantId()));
                item.setVariant(variant);
            } else if (itemReq.getProductId() != null) {
                Product product = productRepository.findById(Integer.valueOf(itemReq.getProductId()))
                        .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + itemReq.getProductId()));
                List<ProductVariant> variants = product.getVariants();
                if (variants != null && !variants.isEmpty()) {
                    item.setVariant(variants.get(0));
                } else {
                    throw new RuntimeException("Sản phẩm \"" + product.getName() + "\" chưa có phiên bản.");
                }
            }

            purchaseOrderItemRepository.save(item);
        }
    }

    // ─── Update Stock (on RECEIVE) ───────────────────────────
    private void updateStock(PurchaseOrder order, List<PurchaseOrderItemRequest> itemRequests, boolean applyUnitConversion) {
        Location targetLocation = null;
        if (order.getLocationId() != null) {
            targetLocation = locationRepository.findById(order.getLocationId()).orElse(null);
        }
        if (targetLocation == null) {
            targetLocation = locationRepository.findAll().stream()
                    .findFirst()
                    .orElse(null);
        }

        for (PurchaseOrderItemRequest itemReq : itemRequests) {
            ProductVariant variant = resolveVariant(itemReq);
            if (variant == null) {
                continue;
            }

            int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 0;
            if (qty <= 0) {
                continue;
            }

            // --- Quy đổi đơn vị (Unit Conversion) ---
            ProductVariant baseVariant = resolveBaseVariant(variant);
            if (baseVariant == null) {
                baseVariant = variant;
            }

            int finalQty = qty;
            String conversionNote = "da nhan so luong quy doi";

            if (applyUnitConversion) {
                conversionNote = "khong quy doi";
                if (baseVariant.getId() != null
                        && variant.getId() != null
                        && !baseVariant.getId().equals(variant.getId())
                        && variant.getUnit() != null) {
                    java.util.Optional<UnitConversion> conversionOpt = unitConversionRepository
                            .findByVariantIdAndToUnitId(baseVariant.getId(), variant.getUnit().getId());
                    if (conversionOpt.isPresent()) {
                        UnitConversion conversion = conversionOpt.get();
                        finalQty = qty * conversion.getConversionFactor().intValue();
                        conversionNote = "quy doi x" + conversion.getConversionFactor().intValue();
                    }
                }
            } else if (baseVariant.getId() != null
                    && variant.getId() != null
                    && !baseVariant.getId().equals(variant.getId())) {
                conversionNote = "luu ton kho theo don vi goc";
            }

            if (finalQty <= 0) {
                continue;
            }

            BigDecimal costPrice = itemReq.getUnitCost() != null ? itemReq.getUnitCost() : BigDecimal.ZERO;
            LocalDate expiryDate = itemReq.getExpiryDate() != null ? itemReq.getExpiryDate() : LocalDate.now().plusYears(1);

            String batchNumber = generateBatchNumber(baseVariant);
            ProductBatch batch = ProductBatch.builder()
                    .variant(baseVariant)
                    .batchNumber(batchNumber)
                    .mfgDate(LocalDate.now())
                    .expiryDate(expiryDate)
                    .costPrice(costPrice)
                    .build();
            batch = productBatchRepository.save(batch);

            InventoryStock stock = InventoryStock.builder()
                    .variant(baseVariant)
                    .batch(batch)
                    .location(targetLocation)
                    .quantity(finalQty)
                    .build();
            inventoryStockRepository.save(stock);
            if (inventoryStockService != null) {
                inventoryStockService.syncConvertedStocksFromBase(baseVariant, targetLocation, batch);
            }

            StockMovement movement = StockMovement.builder()
                    .variant(baseVariant)
                    .batch(batch)
                    .location(targetLocation)
                    .type("IN")
                    .quantity(finalQty)
                    .referenceType("purchase_order")
                    .referenceId(order.getId() != null ? order.getId().longValue() : null)
                    .notes("Nhập hàng từ PO " + order.getOrderNumber() + " (" + conversionNote + ")")
                    .build();
            stockMovementRepository.save(movement);

            log.info("Stock IN: variant={}, batch={}, qty={}, note={}",
                    baseVariant.getSku(),
                    batchNumber,
                    finalQty,
                    conversionNote);
        }
    }

    // ─── Sync Purchase Price from Receipt ────────────────────
    private List<SyncedPurchasePriceItemResponse> syncPurchasePrices(PurchaseOrder order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return new ArrayList<>();
        }

        Set<Integer> syncedVariantIds = new HashSet<>();
        List<SyncedPurchasePriceItemResponse> syncedItems = new ArrayList<>();

        for (PurchaseOrderItem item : order.getItems()) {
            if (item == null || item.getVariant() == null || item.getVariant().getId() == null) {
                continue;
            }
            if (item.getReceivedQuantity() == null || item.getReceivedQuantity() <= 0) {
                continue;
            }
            if (item.getUnitCost() == null || item.getUnitCost().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            ProductVariant sourceVariant = item.getVariant();
            Integer conversionFactorValue = resolveConversionFactor(sourceVariant);
            int conversionFactor = conversionFactorValue != null && conversionFactorValue > 0
                    ? conversionFactorValue
                    : 1;

            SyncedPurchasePriceItemResponse sourceSyncedItem = syncPurchasePriceSafely(
                    sourceVariant,
                    item.getUnitCost(),
                    syncedVariantIds,
                    order
            );
            if (sourceSyncedItem != null) {
                syncedItems.add(sourceSyncedItem);
            }

            ProductVariant baseVariant = resolveBaseVariant(sourceVariant);
            if (conversionFactor > 1
                    && baseVariant != null
                    && baseVariant.getId() != null
                    && !baseVariant.getId().equals(sourceVariant.getId())) {
                BigDecimal baseUnitCost = item.getUnitCost()
                        .divide(BigDecimal.valueOf(conversionFactor), 4, RoundingMode.HALF_UP);
                SyncedPurchasePriceItemResponse baseSyncedItem = syncPurchasePriceSafely(
                        baseVariant,
                        baseUnitCost,
                        syncedVariantIds,
                        order
                );
                if (baseSyncedItem != null) {
                    syncedItems.add(baseSyncedItem);
                }
            }
        }

        return syncedItems;
    }

    private SyncedPurchasePriceItemResponse syncPurchasePriceSafely(ProductVariant variant, BigDecimal purchasePrice,
            Set<Integer> syncedVariantIds, PurchaseOrder order) {
        try {
            if (variant == null || variant.getId() == null) {
                return null;
            }
            if (purchasePrice == null || purchasePrice.compareTo(BigDecimal.ZERO) <= 0) {
                return null;
            }
            if (!syncedVariantIds.add(variant.getId())) {
                return null;
            }

            variantPriceService.syncActivePurchasePrice(variant.getId(), purchasePrice);
            log.info("Synced purchase price from PO {} for variant {} ({}) -> {}",
                    order != null ? order.getOrderNumber() : "N/A",
                    variant.getId(),
                    variant.getSku(),
                    purchasePrice);

            return SyncedPurchasePriceItemResponse.builder()
                    .variantId(variant.getId())
                    .productName(variant.getProduct() != null ? variant.getProduct().getName() : null)
                    .sku(variant.getSku())
                    .purchasePrice(purchasePrice)
                    .build();
        } catch (Exception ex) {
            log.warn("Skip syncing purchase price for variant {} from PO {} due to error: {}",
                    variant != null ? variant.getId() : null,
                    order != null ? order.getOrderNumber() : "N/A",
                    ex.getMessage());
            return null;
        }
    }

    private String generateBatchNumber(ProductVariant variant) {
        String skuPrefix = "BATCH";
        if (variant != null && variant.getSku() != null && !variant.getSku().isBlank()) {
            skuPrefix = variant.getSku().replaceAll("[^A-Za-z0-9]", "").toUpperCase();
            if (skuPrefix.length() > 6) {
                skuPrefix = skuPrefix.substring(0, 6);
            }
            if (skuPrefix.isBlank()) {
                skuPrefix = "BATCH";
            }
        }
        long count = productBatchRepository.count() + 1;
        return skuPrefix + String.format("-%06d", count);
    }

    private ProductVariant resolveVariant(PurchaseOrderItemRequest itemReq) {
        if (itemReq == null) {
            return null;
        }

        if (itemReq.getVariantId() != null) {
            return productVariantRepository.findById(itemReq.getVariantId()).orElse(null);
        }

        if (itemReq.getProductId() != null) {
            Product product = productRepository.findById(Integer.valueOf(itemReq.getProductId())).orElse(null);
            if (product != null && product.getVariants() != null && !product.getVariants().isEmpty()) {
                return product.getVariants().get(0);
            }
        }

        return null;
    }


    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean sameMoney(BigDecimal left, BigDecimal right) {
        return normalizeMoney(left).compareTo(normalizeMoney(right)) == 0;
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value.stripTrailingZeros();
    }

    private boolean shouldUseReceivedFinancials(PurchaseOrder order) {
        if (order == null || order.getStatus() == null) {
            return false;
        }
        return order.getStatus() == PurchaseOrderStatus.RECEIVED
                || order.getStatus() == PurchaseOrderStatus.SHORTAGE_PENDING_APPROVAL
                || order.getStatus() == PurchaseOrderStatus.SUPPLIER_SUPPLEMENT_PENDING;
    }

    private BigDecimal calculateReceivedSubtotal(PurchaseOrder order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }

        return order.getItems().stream()
                .filter(Objects::nonNull)
                .map(item -> {
                    int receivedQty = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
                    BigDecimal unitCost = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;
                    Integer factorValue = resolveConversionFactor(item.getVariant());
                    int factor = factorValue != null && factorValue > 0 ? factorValue : 1;
                    BigDecimal orderedEquivalentQty = BigDecimal.valueOf(receivedQty)
                            .divide(BigDecimal.valueOf(factor), 4, RoundingMode.HALF_UP);
                    return unitCost.multiply(orderedEquivalentQty);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTaxAmount(BigDecimal subtotal, BigDecimal discountAmount, BigDecimal taxPercent) {
        BigDecimal safeSubtotal = subtotal != null ? subtotal : BigDecimal.ZERO;
        BigDecimal safeDiscountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        BigDecimal safeTaxPercent = taxPercent != null ? taxPercent : BigDecimal.ZERO;

        BigDecimal afterDiscount = safeSubtotal.subtract(safeDiscountAmount);
        if (afterDiscount.compareTo(BigDecimal.ZERO) < 0) {
            afterDiscount = BigDecimal.ZERO;
        }

        return afterDiscount.multiply(safeTaxPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateTotalAmount(
            BigDecimal subtotal,
            BigDecimal discountAmount,
            BigDecimal taxAmount,
            BigDecimal shippingFee
    ) {
        BigDecimal safeSubtotal = subtotal != null ? subtotal : BigDecimal.ZERO;
        BigDecimal safeDiscountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        BigDecimal safeTaxAmount = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        BigDecimal safeShippingFee = shippingFee != null ? shippingFee : BigDecimal.ZERO;

        BigDecimal afterDiscount = safeSubtotal.subtract(safeDiscountAmount);
        if (afterDiscount.compareTo(BigDecimal.ZERO) < 0) {
            afterDiscount = BigDecimal.ZERO;
        }

        return afterDiscount.add(safeTaxAmount).add(safeShippingFee);
    }

    // ─── Validation ──────────────────────────────────────────
    private boolean hasResubmissionChanges(PurchaseOrder existingOrder, PurchaseOrderRequest request) {
        if (existingOrder == null || request == null) {
            return false;
        }

        Integer existingSupplierId = existingOrder.getSupplier() != null ? existingOrder.getSupplier().getId() : null;
        Long existingContractId = existingOrder.getContract() != null ? existingOrder.getContract().getId() : null;

        if (!Objects.equals(existingSupplierId, request.getSupplierId())) {
            return true;
        }
        if (!Objects.equals(existingContractId, request.getContractId())) {
            return true;
        }
        if (!Objects.equals(existingOrder.getLocationId(), request.getLocationId())) {
            return true;
        }
        if (!Objects.equals(existingOrder.getExpectedDeliveryDate(), request.getExpectedDeliveryDate())) {
            return true;
        }
        if (!Objects.equals(trimToNull(existingOrder.getNotes()), trimToNull(request.getNotes()))) {
            return true;
        }

        if (!sameMoney(existingOrder.getDiscountAmount(), request.getDiscountAmount())) {
            return true;
        }
        if (!sameMoney(existingOrder.getTaxAmount(), request.getTaxAmount())) {
            return true;
        }
        if (!sameMoney(existingOrder.getTaxPercent(), request.getTaxPercent())) {
            return true;
        }
        if (!sameMoney(existingOrder.getShippingFee(), request.getShippingFee())) {
            return true;
        }
        if (!sameMoney(existingOrder.getPaidAmount(), request.getPaidAmount())) {
            return true;
        }

        return !sameItemSnapshot(existingOrder.getItems(), request.getItems());
    }

    private boolean sameItemSnapshot(List<PurchaseOrderItem> existingItems, List<PurchaseOrderItemRequest> requestItems) {
        List<String> existingSnapshot = (existingItems == null ? new ArrayList<PurchaseOrderItem>() : existingItems).stream()
                .map(this::toExistingItemSnapshot)
                .sorted()
                .collect(Collectors.toList());

        List<String> requestSnapshot = (requestItems == null ? new ArrayList<PurchaseOrderItemRequest>() : requestItems).stream()
                .map(this::toRequestItemSnapshot)
                .sorted()
                .collect(Collectors.toList());

        return existingSnapshot.equals(requestSnapshot);
    }

    private String toExistingItemSnapshot(PurchaseOrderItem item) {
        Integer variantId = item.getVariant() != null ? item.getVariant().getId() : null;
        Integer productId = item.getVariant() != null && item.getVariant().getProduct() != null
                ? item.getVariant().getProduct().getId()
                : null;

        return String.join("|",
                String.valueOf(variantId),
                String.valueOf(productId),
                String.valueOf(item.getQuantity() != null ? item.getQuantity() : 0),
                normalizeMoney(item.getUnitCost()).toPlainString(),
                String.valueOf(item.getExpiryDate()),
                String.valueOf(trimToNull(item.getNotes())));
    }

    private String toRequestItemSnapshot(PurchaseOrderItemRequest item) {
        return String.join("|",
                String.valueOf(item.getVariantId()),
                String.valueOf(item.getProductId()),
                String.valueOf(item.getQuantity() != null ? item.getQuantity() : 0),
                normalizeMoney(item.getUnitCost()).toPlainString(),
                String.valueOf(item.getExpiryDate()),
                String.valueOf(trimToNull(item.getNotes())));
    }

    private void validateDraft(PurchaseOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Phiếu nhập phải có ít nhất 1 sản phẩm.");
        }
        for (PurchaseOrderItemRequest item : request.getItems()) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng sản phẩm phải > 0.");
            }
        }
    }

    private void validateConfirm(PurchaseOrderRequest request) {
        validateDraft(request);
        if (request.getSupplierId() == null) {
            throw new RuntimeException("Vui lòng chọn nhà cung cấp trước khi xác nhận.");
        }
    }

    // ─── Mappers ─────────────────────────────────────────────
    private PurchaseOrderResponse toListResponse(PurchaseOrder order) {
        BigDecimal subtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;

        if (shouldUseReceivedFinancials(order)) {
            subtotal = calculateReceivedSubtotal(order);
            taxAmount = calculateTaxAmount(subtotal, order.getDiscountAmount(), order.getTaxPercent());
            totalAmount = calculateTotalAmount(
                    subtotal,
                    order.getDiscountAmount(),
                    taxAmount,
                    order.getShippingFee());
        }

        PurchaseOrderResponse.PurchaseOrderResponseBuilder builder = PurchaseOrderResponse.builder()
                .id(order.getId() != null ? order.getId().intValue() : null)
                .orderNumber(order.getOrderNumber())
                .supplierId(order.getSupplier() != null ? order.getSupplier().getId() : null)
                .supplierName(order.getSupplier() != null ? order.getSupplier().getName() : "")
                .status(order.getStatus() != null ? order.getStatus().name() : "DRAFT")
                .orderDate(order.getOrderDate())
                .createdAt(order.getCreatedAt())
                .subtotal(subtotal)
                .discountAmount(order.getDiscountAmount())
                .taxAmount(taxAmount)
                .taxPercent(order.getTaxPercent())
                .totalAmount(totalAmount)
                .shippingFee(order.getShippingFee())
                .paidAmount(order.getPaidAmount())
                .locationId(order.getLocationId())
                .notes(order.getNotes())
                .rejectionReason(order.getRejectionReason())
                .shortageReason(order.getShortageReason())
                .shortageSubmittedAt(order.getShortageSubmittedAt())
                .managerDecision(order.getManagerDecision())
                .managerDecisionNote(order.getManagerDecisionNote())
                .managerDecidedAt(order.getManagerDecidedAt());

        // Contract info
        if (order.getContract() != null) {
            builder.contractId(order.getContract().getId())
                    .contractNumber(order.getContract().getContractNumber())
                    .contractTitle(order.getContract().getTitle());
        }

        return builder.build();
    }

    private PurchaseOrderResponse toDetailResponse(PurchaseOrder order) {
        PurchaseOrderResponse response = toListResponse(order);

        if (order.getItems() != null) {
            List<PurchaseOrderItemResponse> itemResponses = order.getItems().stream()
                    .map(item -> PurchaseOrderItemResponse.builder()
                    .id(item.getId() != null ? item.getId().intValue() : null)
                    .variantId(item.getVariant() != null && item.getVariant().getId() != null
                            ? item.getVariant().getId().intValue() : null)
                    .productId(item.getVariant() != null && item.getVariant().getProduct() != null
                            && item.getVariant().getProduct().getId() != null
                            ? item.getVariant().getProduct().getId().intValue() : null)
                    .sku(item.getVariant() != null ? item.getVariant().getSku() : "")
                    .name(item.getVariant() != null && item.getVariant().getProduct() != null
                            ? item.getVariant().getProduct().getName() : "")
                    .imageUrl(item.getVariant() != null
                            ? (item.getVariant().getImageUrl() != null
                            ? item.getVariant().getImageUrl()
                            : (item.getVariant().getProduct() != null ? item.getVariant().getProduct().getImageUrl() : null))
                            : null)
                    .attributes(item.getVariant() != null ? item.getVariant().getAttributes() : null)
                    .quantity(item.getQuantity())
                    .unit(item.getVariant() != null && item.getVariant().getUnit() != null
                            ? item.getVariant().getUnit().getName() : null)
                    .unitCost(item.getUnitCost())
                    .totalCost(item.getTotalCost() != null ? item.getTotalCost() : (item.getUnitCost() != null ? item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity() != null ? item.getQuantity() : 0)) : BigDecimal.ZERO))
                    .receivedQuantity(item.getReceivedQuantity())
                    .checkingUnit(resolveCheckingUnit(item.getVariant()))
                    .conversionFactor(resolveConversionFactor(item.getVariant()))
                    .checkingQuantity(resolveCheckingQuantity(item))
                    .notes(item.getNotes())
                    .expiryDate(item.getExpiryDate())
                    .build())
                    .collect(Collectors.toList());
            response.setItems(itemResponses);
        } else {
            response.setItems(new ArrayList<>());
        }

        return response;
    }

    private String resolveCheckingUnit(ProductVariant variant) {
        ProductVariant baseVariant = resolveBaseVariant(variant);
        if (baseVariant != null && baseVariant.getUnit() != null) {
            return baseVariant.getUnit().getName();
        }
        return variant != null && variant.getUnit() != null ? variant.getUnit().getName() : null;
    }

    private Integer resolveConversionFactor(ProductVariant variant) {
        if (variant == null) {
            return 1;
        }
        ProductVariant baseVariant = resolveBaseVariant(variant);
        Integer baseVariantId = baseVariant != null ? baseVariant.getId() : null;
        Integer variantId = variant.getId();

        if (baseVariant == null || baseVariantId == null || variantId == null || baseVariantId.equals(variantId)
                || variant.getUnit() == null) {
            return 1;
        }
        return unitConversionRepository
                .findByVariantIdAndToUnitId(baseVariantId, variant.getUnit().getId())
                .map(uc -> uc.getConversionFactor().intValue())
                .orElse(1);
    }

    private Integer resolveCheckingQuantity(PurchaseOrderItem item) {
        if (item == null) {
            return 0;
        }
        int orderedQty = item.getQuantity() != null ? item.getQuantity() : 0;
        int receivedQty = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
        ProductVariant variant = item.getVariant();
        Integer factor = resolveConversionFactor(variant);
        int conversionFactor = factor != null && factor > 0 ? factor : 1;

        if (conversionFactor <= 1) {
            return orderedQty > 0 ? orderedQty : receivedQty;
        }

        int baseQty = orderedQty * conversionFactor;
        return baseQty > 0 ? baseQty : receivedQty;
    }

    private ProductVariant resolveBaseVariant(ProductVariant variant) {
        if (variant == null || variant.getProduct() == null) {
            return variant;
        }

        Integer productId = variant.getProduct().getId();
        Integer unitId = variant.getUnit() != null ? variant.getUnit().getId() : null;
        if (productId != null && unitId != null) {
            List<UnitConversion> conversions = unitConversionRepository.findByProductIdAndToUnitId(productId, unitId);
            ProductVariant fallbackCandidate = null;
            for (UnitConversion conversion : conversions) {
                if (conversion == null || conversion.getVariant() == null || conversion.getVariant().getId() == null) {
                    continue;
                }
                ProductVariant candidate = conversion.getVariant();
                if (candidate.getId().equals(variant.getId()) || !hasSameAttributes(candidate, variant)) {
                    continue;
                }
                if (candidate.isBaseUnit()) {
                    return candidate;
                }
                if (fallbackCandidate == null) {
                    fallbackCandidate = candidate;
                }
            }
            if (fallbackCandidate != null) {
                return fallbackCandidate;
            }

            ProductVariant declaredBaseVariant = productVariantRepository
                    .findByProductIdAndIsBaseUnitTrue(productId)
                    .orElse(null);
            if (declaredBaseVariant != null
                    && declaredBaseVariant.getId() != null
                    && !declaredBaseVariant.getId().equals(variant.getId())
                    && hasSameAttributes(declaredBaseVariant, variant)) {
                return declaredBaseVariant;
            }
        }

        if (variant.getProduct().getVariants() == null) {
            return variant;
        }

        Integer variantId = variant.getId();
        for (ProductVariant candidate : variant.getProduct().getVariants()) {
            if (candidate == null || candidate.getId() == null) {
                continue;
            }
            if (variantId != null && candidate.getId().equals(variantId)) {
                continue;
            }
            if (unitId == null || !hasSameAttributes(candidate, variant)) {
                continue;
            }
            if (unitConversionRepository.findByVariantIdAndToUnitId(candidate.getId(), unitId).isPresent()) {
                return candidate;
            }
        }

        return variant;
    }

    private boolean hasSameAttributes(ProductVariant left, ProductVariant right) {
        Map<String, String> leftAttrs = left != null && left.getAttributes() != null
                ? left.getAttributes()
                : java.util.Collections.emptyMap();
        Map<String, String> rightAttrs = right != null && right.getAttributes() != null
                ? right.getAttributes()
                : java.util.Collections.emptyMap();
        return leftAttrs.equals(rightAttrs);
    }
}
