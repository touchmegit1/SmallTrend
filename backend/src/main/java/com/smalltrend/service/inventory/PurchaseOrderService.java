package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.entity.*;
import com.smalltrend.entity.enums.PurchaseOrderStatus;
import com.smalltrend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final LocationRepository locationRepository;
    private final StockMovementRepository stockMovementRepository;

    // ═══════════════════════════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════════════════════════
    // ─── List All Purchase Orders ────────────────────────────
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
    public PurchaseOrderResponse getOrderById(Integer id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + id));
        return toDetailResponse(order);
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
            updateStock(savedOrder, itemRequests);
        }

        log.info("✅ Purchase Order {} CONFIRMED. Stock updated.", savedOrder.getOrderNumber());
        return toDetailResponse(purchaseOrderRepository.findById(savedOrder.getId()).orElse(savedOrder));
    }

    // ─── Approve Pending Order (Manager approves) ──────────
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

        List<PurchaseOrderItemRequest> itemRequests = order.getItems().stream()
                .map(item -> PurchaseOrderItemRequest.builder()
                .variantId(item.getVariant() != null ? item.getVariant().getId().intValue() : null)
                .productId(item.getVariant() != null && item.getVariant().getProduct() != null
                        ? item.getVariant().getProduct().getId().intValue() : null)
                .quantity(item.getQuantity())
                .unitCost(item.getUnitCost())
                .totalCost(item.getTotalCost())
                .build())
                .collect(Collectors.toList());

        updateStock(order, itemRequests);

        log.info("✅ Purchase Order {} APPROVED by Manager. Stock updated.", order.getOrderNumber());
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

        // ── Stock Update from existing items ──
        List<PurchaseOrderItemRequest> itemRequests = order.getItems().stream()
                .map(item -> PurchaseOrderItemRequest.builder()
                .variantId(item.getVariant() != null ? item.getVariant().getId().intValue() : null)
                .productId(item.getVariant() != null && item.getVariant().getProduct() != null
                        ? item.getVariant().getProduct().getId().intValue() : null)
                .quantity(item.getQuantity())
                .unitCost(item.getUnitCost())
                .totalCost(item.getTotalCost())
                .build())
                .collect(Collectors.toList());

        updateStock(order, itemRequests);

        log.info("✅ Existing Draft {} CONFIRMED. Stock updated.", order.getOrderNumber());
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

        order.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        order.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        order.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
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

        log.info("🚫 Purchase Order {} REJECTED. Reason: {}", order.getOrderNumber(), reason);
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

        log.info("❌ Purchase Order {} CANCELLED.", order.getOrderNumber());
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

        log.info("🗑️ Purchase Order {} DELETED.", order.getOrderNumber());
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

    // ─── Get All Products (with variant info, stock quantity, unit) ─
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(p -> {
                    ProductResponse.ProductResponseBuilder builder = ProductResponse.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .imageUrl(p.getImageUrl());

                    int totalStock = 0;

                    if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                        // Lấy SKU, giá, đơn vị từ variant đầu tiên
                        ProductVariant firstVariant = p.getVariants().get(0);
                        builder.sku(firstVariant.getSku());
                        builder.purchasePrice(firstVariant.getSellPrice());

                        if (firstVariant.getUnit() != null) {
                            builder.unit(firstVariant.getUnit().getName());
                        }

                        // Tính tổng tồn kho từ tất cả variants
                        for (ProductVariant v : p.getVariants()) {
                            if (v.getInventoryStocks() != null) {
                                for (InventoryStock stock : v.getInventoryStocks()) {
                                    if (stock.getQuantity() != null) {
                                        totalStock += stock.getQuantity();
                                    }
                                }
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
                .totalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO)
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .notes(request.getNotes())
                .build();

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Nhà cung cấp không tồn tại."));
            order.setSupplier(supplier);
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

        BigDecimal total = afterDiscount.add(taxAmount);
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

    // ─── Update Stock (on CONFIRM) ───────────────────────────
    private void updateStock(PurchaseOrder order, List<PurchaseOrderItemRequest> itemRequests) {
        // Get a default location
        Location defaultLocation = locationRepository.findAll().stream()
                .findFirst()
                .orElse(null);

        for (PurchaseOrderItemRequest itemReq : itemRequests) {
            // 1. Resolve variant
            ProductVariant variant = resolveVariant(itemReq);
            if (variant == null) {
                continue;
            }

            int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 0;
            if (qty <= 0) {
                continue;
            }

            BigDecimal costPrice = itemReq.getUnitCost() != null ? itemReq.getUnitCost() : BigDecimal.ZERO;

            LocalDate expiryDate = LocalDate.now().plusYears(1);

            // 3. Create ProductBatch
            String batchNumber = generateBatchNumber(variant);
            ProductBatch batch = ProductBatch.builder()
                    .variant(variant)
                    .batchNumber(batchNumber)
                    .mfgDate(LocalDate.now())
                    .expiryDate(expiryDate)
                    .costPrice(costPrice)
                    .build();
            batch = productBatchRepository.save(batch);

            // 4. Create or update InventoryStock
            InventoryStock stock = InventoryStock.builder()
                    .variant(variant)
                    .batch(batch)
                    .location(defaultLocation)
                    .quantity(qty)
                    .build();
            inventoryStockRepository.save(stock);

            // 5. Create StockMovement for audit
            StockMovement movement = StockMovement.builder()
                    .variant(variant)
                    .batch(batch)
                    .location(defaultLocation)
                    .type("IN")
                    .quantity(qty)
                    .referenceType("purchase_order")
                    .referenceId(order.getId() != null ? order.getId().longValue() : null)
                    .notes("Nhập hàng từ PO " + order.getOrderNumber())
                    .build();
            stockMovementRepository.save(movement);

            log.info("📦 Stock IN: variant={}, batch={}, qty={}", variant.getSku(), batchNumber, qty);
        }
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
        return PurchaseOrderResponse.builder()
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
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .rejectionReason(order.getRejectionReason())
                .build();
    }

    private PurchaseOrderResponse toDetailResponse(PurchaseOrder order) {
        PurchaseOrderResponse response = toListResponse(order);

        if (order.getItems() != null) {
            List<PurchaseOrderItemResponse> itemResponses = order.getItems().stream()
                    .map(item -> PurchaseOrderItemResponse.builder()
                    .id(item.getId() != null ? item.getId().intValue() : null)
                    .variantId(item.getVariant() != null ? item.getVariant().getId().intValue() : null)
                    .productId(item.getVariant() != null && item.getVariant().getProduct() != null
                            ? item.getVariant().getProduct().getId().intValue() : null)
                    .sku(item.getVariant() != null ? item.getVariant().getSku() : "")
                    .name(item.getVariant() != null && item.getVariant().getProduct() != null
                            ? item.getVariant().getProduct().getName() : "")
                    .imageUrl(item.getVariant() != null ? item.getVariant().getImageUrl() : null)
                    .quantity(item.getQuantity())
                    .unitCost(item.getUnitCost())
                    .totalCost(item.getTotalCost() != null ? item.getTotalCost() : (item.getUnitCost() != null ? item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity() != null ? item.getQuantity() : 0)) : BigDecimal.ZERO))
                    .build())
                    .collect(Collectors.toList());
            response.setItems(itemResponses);
        } else {
            response.setItems(new ArrayList<>());
        }

        return response;
    }
}
