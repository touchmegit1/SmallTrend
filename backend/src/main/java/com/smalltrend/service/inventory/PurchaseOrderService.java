package com.smalltrend.service.inventory;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.entity.*;
import com.smalltrend.entity.enums.PurchaseOrderStatus;
import com.smalltrend.repository.*;
import com.smalltrend.service.VariantPriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

    // ═══════════════════════════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════════════════════════
    // ─── List All Purchase Orders ────────────────────────────
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllOrders() {
        return purchaseOrderRepository.findAll()
                .stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) {
                        return 0;
                    }
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
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
        if (request.getStatus() != null && "PENDING".equalsIgnoreCase(request.getStatus())) {
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

        Integer effectiveSupplierId = receiptRequest.getSupplierId() != null
                ? receiptRequest.getSupplierId()
                : (order.getSupplier() != null ? order.getSupplier().getId() : null);
        Integer effectiveLocationId = receiptRequest.getLocationId() != null
                ? receiptRequest.getLocationId()
                : order.getLocationId();
        BigDecimal effectiveTaxPercent = receiptRequest.getTaxPercent() != null
                ? receiptRequest.getTaxPercent()
                : (order.getTaxPercent() != null ? order.getTaxPercent() : BigDecimal.ZERO);
        BigDecimal effectiveShippingFee = receiptRequest.getShippingFee() != null
                ? receiptRequest.getShippingFee()
                : (order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO);

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

        boolean hasShortage = false;
        List<PurchaseOrderItemRequest> stockItemRequests = new ArrayList<>();

        if (receiptRequest.getItems() != null) {
            for (GoodsReceiptRequest.GoodsReceiptItemRequest receiptItem : receiptRequest.getItems()) {
                if (receiptItem.getReceivedQuantity() == null || receiptItem.getReceivedQuantity() < 0) {
                    throw new RuntimeException("Số lượng thực nhận không hợp lệ.");
                }

                PurchaseOrderItem orderItem = order.getItems().stream()
                        .filter(i -> i.getId().equals(receiptItem.getItemId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong phiếu nhập."));

                int orderedQty = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
                Integer conversionFactorValue = resolveConversionFactor(orderItem.getVariant());
                int conversionFactor = conversionFactorValue != null && conversionFactorValue > 0
                        ? conversionFactorValue
                        : 1;
                int expectedCheckingQty = orderedQty * conversionFactor;

                int previousReceivedQty = orderItem.getReceivedQuantity() != null ? orderItem.getReceivedQuantity() : 0;
                int newReceivedQty = receiptItem.getReceivedQuantity();
                if (newReceivedQty < previousReceivedQty) {
                    throw new RuntimeException("Số lượng thực nhận không được nhỏ hơn số đã nhập trước đó.");
                }
                int deltaReceivedQty = newReceivedQty - previousReceivedQty;

                if (newReceivedQty < expectedCheckingQty) {
                    hasShortage = true;
                }

                orderItem.setReceivedQuantity(newReceivedQty);
                orderItem.setUnitCost(receiptItem.getUnitCost());
                orderItem.setTotalCost(receiptItem.getUnitCost().multiply(BigDecimal.valueOf(newReceivedQty)));
                if (receiptItem.getExpiryDate() != null) {
                    orderItem.setExpiryDate(receiptItem.getExpiryDate());
                }
                if (receiptItem.getNotes() != null) {
                    orderItem.setNotes(receiptItem.getNotes());
                }
                purchaseOrderItemRepository.save(orderItem);

                if (deltaReceivedQty > 0) {
                    stockItemRequests.add(PurchaseOrderItemRequest.builder()
                            .variantId(orderItem.getVariant() != null ? orderItem.getVariant().getId().intValue() : null)
                            .productId(orderItem.getVariant() != null && orderItem.getVariant().getProduct() != null
                                    ? orderItem.getVariant().getProduct().getId().intValue() : null)
                            .quantity(deltaReceivedQty)
                            .unitCost(receiptItem.getUnitCost())
                            .totalCost(receiptItem.getUnitCost().multiply(BigDecimal.valueOf(deltaReceivedQty)))
                            .expiryDate(orderItem.getExpiryDate())
                            .build());
                }
            }
        }

        if (stockItemRequests.isEmpty() && receiptRequest.getItems() != null && !receiptRequest.getItems().isEmpty()) {
            throw new RuntimeException("Không có số lượng mới để nhập kho.");
        }

        Supplier supplier = supplierRepository.findById(effectiveSupplierId)
                .orElseThrow(() -> new RuntimeException("Nhà cung cấp không tồn tại."));
        order.setSupplier(supplier);
        order.setLocationId(effectiveLocationId);

        BigDecimal subtotal = order.getItems().stream()
                .map(item -> {
                    int receivedQty = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
                    BigDecimal unitCost = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;
                    return unitCost.multiply(BigDecimal.valueOf(receivedQty));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discountAmount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        if (afterDiscount.compareTo(BigDecimal.ZERO) < 0) {
            afterDiscount = BigDecimal.ZERO;
        }
        BigDecimal taxPercent = receiptRequest.getTaxPercent();
        BigDecimal taxAmount = afterDiscount.multiply(taxPercent).divide(BigDecimal.valueOf(100));
        BigDecimal shippingFee = receiptRequest.getShippingFee();
        BigDecimal totalAmount = afterDiscount.add(taxAmount).add(shippingFee);

        order.setSubtotal(subtotal);
        order.setTaxPercent(taxPercent);
        order.setTaxAmount(taxAmount);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);
        order.setActualDeliveryDate(LocalDate.now());
        if (receiptRequest.getNotes() != null) {
            order.setNotes(receiptRequest.getNotes());
        }

        if (!stockItemRequests.isEmpty()) {
            updateStock(order, stockItemRequests, false);
        }

        int syncedPurchasePriceCount = syncPurchasePrices(order);

        if (hasShortage) {
            if (receiptRequest.getShortageReason() == null || receiptRequest.getShortageReason().isBlank()) {
                throw new RuntimeException("Vui lòng nhập lý do thiếu hàng trước khi gửi quản lý.");
            }
            order.setShortageReason(receiptRequest.getShortageReason().trim());
            order.setShortageSubmittedAt(LocalDateTime.now());
            order.setManagerDecision("REQUEST_SUPPLEMENT");
            order.setManagerDecisionNote(null);
            order.setManagerDecidedAt(null);
            order.setStatus(PurchaseOrderStatus.SUPPLIER_SUPPLEMENT_PENDING);
            notifyManagersOnShortage(order);
        } else {
            order.setStatus(PurchaseOrderStatus.RECEIVED);
            order.setShortageReason(null);
            order.setShortageSubmittedAt(null);
            order.setManagerDecision(null);
            order.setManagerDecisionNote(null);
            order.setManagerDecidedAt(null);
        }

        purchaseOrderRepository.save(order);

        log.info("📦 Purchase Order {} receive processed. Status={}, stock delta updated.",
                order.getOrderNumber(),
                order.getStatus());

        PurchaseOrderResponse response = toDetailResponse(order);
        response.setSyncedPurchasePriceCount(syncedPurchasePriceCount);
        return response;
    }

    @Transactional
    public PurchaseOrderResponse closeShortage(Integer orderId, String managerDecisionNote) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (order.getStatus() != PurchaseOrderStatus.SHORTAGE_PENDING_APPROVAL) {
            throw new RuntimeException("Chỉ có thể chốt thiếu khi phiếu đang chờ quản lý xử lý thiếu hàng.");
        }

        order.setManagerDecision("CLOSE_SHORTAGE");
        order.setManagerDecisionNote(managerDecisionNote);
        order.setManagerDecidedAt(LocalDateTime.now());
        order.setStatus(PurchaseOrderStatus.RECEIVED);
        purchaseOrderRepository.save(order);

        List<PurchaseOrderItemRequest> itemRequests = order.getItems().stream()
                .map(item -> PurchaseOrderItemRequest.builder()
                .variantId(item.getVariant() != null ? item.getVariant().getId().intValue() : null)
                .productId(item.getVariant() != null && item.getVariant().getProduct() != null
                        ? item.getVariant().getProduct().getId().intValue() : null)
                .quantity(item.getReceivedQuantity() != null ? item.getReceivedQuantity() : item.getQuantity())
                .unitCost(item.getUnitCost())
                .totalCost(item.getTotalCost())
                .expiryDate(item.getExpiryDate())
                .build())
                .collect(Collectors.toList());

        updateStock(order, itemRequests, false);

        int syncedPurchasePriceCount = syncPurchasePrices(order);

        log.info("✅ Purchase Order {} shortage closed by manager. Stock updated.", order.getOrderNumber());
        PurchaseOrderResponse response = toDetailResponse(order);
        response.setSyncedPurchasePriceCount(syncedPurchasePriceCount);
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

        log.info("📦 Purchase Order {} moved to SUPPLIER_SUPPLEMENT_PENDING.", order.getOrderNumber());
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
                            .imageUrl(p != null ? p.getImageUrl() : null)
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
            ProductVariant baseVariant = variant;
            int finalQty = qty;
            String conversionNote = "khong quy doi";

            if (applyUnitConversion && variant.getProduct() != null && variant.getProduct().getVariants() != null) {
                for (ProductVariant bv : variant.getProduct().getVariants()) {
                    if (bv.getId().equals(variant.getId())) {
                        continue;
                    }

                    if (variant.getUnit() != null) {
                        java.util.Optional<UnitConversion> conversionOpt = unitConversionRepository.findByVariantIdAndToUnitId(bv.getId(), variant.getUnit().getId());
                        if (conversionOpt.isPresent()) {
                            UnitConversion conversion = conversionOpt.get();
                            baseVariant = bv;
                            finalQty = qty * conversion.getConversionFactor().intValue();
                            conversionNote = "quy doi x" + conversion.getConversionFactor().intValue();
                            break;
                        }
                    }
                }
            } else if (!applyUnitConversion) {
                conversionNote = "da nhan so luong quy doi";
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

            log.info("📦 Stock IN: variant={}, batch={}, qty={}, note={}",
                    baseVariant.getSku(),
                    batchNumber,
                    finalQty,
                    conversionNote);
        }
    }

    // ─── Sync Purchase Price from Receipt ────────────────────
    private int syncPurchasePrices(PurchaseOrder order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return 0;
        }

        Set<Integer> syncedVariantIds = new HashSet<>();
        int syncedCount = 0;

        for (PurchaseOrderItem item : order.getItems()) {
            if (item == null || item.getVariant() == null || item.getVariant().getId() == null) {
                continue;
            }
            Integer variantId = item.getVariant().getId().intValue();
            if (!syncedVariantIds.add(variantId)) {
                continue;
            }

            if (item.getReceivedQuantity() == null || item.getReceivedQuantity() <= 0) {
                continue;
            }
            if (item.getUnitCost() == null || item.getUnitCost().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            try {
                boolean synced = variantPriceService.syncActivePurchasePrice(variantId, item.getUnitCost());
                if (synced) {
                    syncedCount++;
                }
            } catch (Exception ex) {
                log.warn("⚠️ Không thể đồng bộ giá nhập cho variant {} từ PO {}: {}",
                        variantId,
                        order.getOrderNumber(),
                        ex.getMessage());
            }
        }

        return syncedCount;
    }

    // ─── Resolve Variant ─────────────────────────────────────
    private ProductVariant resolveVariant(PurchaseOrderItemRequest itemReq) {
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

    // ─── Generate Batch Number ───────────────────────────────
    private String generateBatchNumber(ProductVariant variant) {
        String prefix = variant.getSku() != null
                ? variant.getSku().substring(0, Math.min(2, variant.getSku().length())).toUpperCase()
                : "BT";
        int year = LocalDate.now().getYear();
        long count = productBatchRepository.count() + 1;
        return prefix + year + String.format("%03d", count);
    }

    // ─── Validation ──────────────────────────────────────────
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
        PurchaseOrderResponse.PurchaseOrderResponseBuilder builder = PurchaseOrderResponse.builder()
                .id(order.getId() != null ? order.getId().intValue() : null)
                .orderNumber(order.getOrderNumber())
                .supplierId(order.getSupplier() != null ? order.getSupplier().getId() : null)
                .supplierName(order.getSupplier() != null ? order.getSupplier().getName() : "")
                .status(order.getStatus() != null ? order.getStatus().name() : "DRAFT")
                .orderDate(order.getOrderDate())
                .createdAt(order.getCreatedAt())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .taxAmount(order.getTaxAmount())
                .taxPercent(order.getTaxPercent())
                .totalAmount(order.getTotalAmount())
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
                    .imageUrl(item.getVariant() != null ? item.getVariant().getImageUrl() : null)
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
        if (variant == null || variant.getProduct() == null || variant.getProduct().getVariants() == null) {
            return variant;
        }

        Integer variantId = variant.getId();
        Integer unitId = variant.getUnit() != null ? variant.getUnit().getId() : null;

        for (ProductVariant candidate : variant.getProduct().getVariants()) {
            if (candidate == null || candidate.getId() == null) {
                continue;
            }
            if (variantId != null && candidate.getId().equals(variantId)) {
                continue;
            }
            if (unitId == null) {
                continue;
            }
            if (unitConversionRepository.findByVariantIdAndToUnitId(candidate.getId(), unitId).isPresent()) {
                return candidate;
            }
        }

        return variant;
    }
}
