package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.inventorycount.*;
import com.smalltrend.dto.inventory.location.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.entity.*;
import com.smalltrend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final SupplierRepository supplierRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final LocationRepository locationRepository;
    private final ShelfBinRepository shelfBinRepository;

    // ─── List All Purchase Orders ────────────────────────────
    public List<PurchaseOrderResponse> getAllOrders() {
        return purchaseOrderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
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
        String prefix = "NH";
        List<PurchaseOrder> allOrders = purchaseOrderRepository.findAll();
        int maxNum = 0;
        for (PurchaseOrder order : allOrders) {
            String code = order.getPoNumber();
            if (code != null && code.startsWith(prefix)) {
                try {
                    int num = Integer.parseInt(code.substring(prefix.length()));
                    if (num > maxNum) maxNum = num;
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
        order.setStatus("DRAFT");
        order.setCreatedAt(LocalDateTime.now());
        order.setOrderDate(LocalDate.now());

        // Generate PO number if not provided
        if (order.getPoNumber() == null || order.getPoNumber().isBlank()) {
            order.setPoNumber(generateNextPOCode());
        }

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        // Save items
        if (request.getItems() != null) {
            saveOrderItems(savedOrder, request.getItems());
        }

        return toDetailResponse(purchaseOrderRepository.findById(savedOrder.getId()).orElse(savedOrder));
    }

    // ─── Confirm Order & Update Stock ────────────────────────
    @Transactional
    public PurchaseOrderResponse confirmOrder(PurchaseOrderRequest request) {
        validateConfirm(request);

        PurchaseOrder order = buildOrderFromRequest(request);
        order.setStatus("CONFIRMED");
        order.setCreatedAt(LocalDateTime.now());
        order.setConfirmedAt(LocalDateTime.now());
        order.setOrderDate(LocalDate.now());

        // Generate PO number if not provided
        if (order.getPoNumber() == null || order.getPoNumber().isBlank()) {
            order.setPoNumber(generateNextPOCode());
        }

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        // Save items and update stock
        if (request.getItems() != null) {
            saveOrderItems(savedOrder, request.getItems());
            updateStockForItems(savedOrder, request.getItems(), request.getLocationId());
        }

        return toDetailResponse(purchaseOrderRepository.findById(savedOrder.getId()).orElse(savedOrder));
    }

    // ─── Confirm Existing Draft ──────────────────────────────
    @Transactional
    public PurchaseOrderResponse confirmExistingOrder(Integer orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể xác nhận phiếu ở trạng thái Phiếu tạm.");
        }

        order.setStatus("CONFIRMED");
        order.setConfirmedAt(LocalDateTime.now());
        purchaseOrderRepository.save(order);

        // Update stock for existing items
        List<PurchaseOrderItem> items = order.getItems();
        if (items != null) {
            for (PurchaseOrderItem item : items) {
                // Create stock movement records if needed
                // (items are already saved, just need stock update)
            }
        }

        return toDetailResponse(order);
    }

    // ─── Cancel Order ────────────────────────────────────────
    @Transactional
    public PurchaseOrderResponse cancelOrder(Integer orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập với ID: " + orderId));

        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể hủy phiếu ở trạng thái Phiếu tạm.");
        }

        order.setStatus("CANCELLED");
        purchaseOrderRepository.save(order);

        return toDetailResponse(order);
    }

    // ─── Get All Suppliers ───────────────────────────────────
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(s -> SupplierResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .contactInfo(s.getContactInfo())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── Get All Products (for search) ───────────────────────
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(p -> ProductResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .imageUrl(p.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── Get All Locations ───────────────────────────────────
    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(l -> LocationResponse.builder()
                        .id(l.getId())
                        .name(l.getName())
                        .type(l.getType())
                        .build())
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════
    //  Private helpers
    // ═══════════════════════════════════════════════════════════

    private PurchaseOrder buildOrderFromRequest(PurchaseOrderRequest request) {
        PurchaseOrder order = PurchaseOrder.builder()
                .poNumber(request.getPoNumber())
                .status(request.getStatus())
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .taxPercent(request.getTaxPercent() != null ? request.getTaxPercent() : BigDecimal.ZERO)
                .shippingFee(request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO)
                .paidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO)
                .subtotal(request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO)
                .taxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO)
                .totalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO)
                .remainingAmount(request.getRemainingAmount() != null ? request.getRemainingAmount() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();

        // Set supplier
        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Nhà cung cấp không tồn tại."));
            order.setSupplier(supplier);
        }

        // Set location
        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Vị trí kho không tồn tại."));
            order.setLocation(location);
        }

        return order;
    }

    private void saveOrderItems(PurchaseOrder savedOrder, List<PurchaseOrderItemRequest> itemRequests) {
        for (PurchaseOrderItemRequest itemReq : itemRequests) {
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(savedOrder)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO)
                    .build();

            // Try to find variant by ID or by product
            if (itemReq.getVariantId() != null) {
                ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId().longValue())
                        .orElseThrow(() -> new RuntimeException("Phiên bản sản phẩm không tồn tại: " + itemReq.getVariantId()));
                item.setVariant(variant);
            } else if (itemReq.getProductId() != null) {
                // If no variant ID, find first variant of the product
                Product product = productRepository.findById(itemReq.getProductId().longValue())
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

    private void updateStockForItems(PurchaseOrder savedOrder, List<PurchaseOrderItemRequest> itemRequests, Integer locationId) {
        for (PurchaseOrderItemRequest itemReq : itemRequests) {
            // Create batch if batch data provided
            if (itemReq.getBatches() != null && !itemReq.getBatches().isEmpty()) {
                for (BatchRequest batchReq : itemReq.getBatches()) {
                    ProductVariant variant = resolveVariant(itemReq);
                    ProductBatch batch = ProductBatch.builder()
                            .variant(variant)
                            .batchNumber(batchReq.getBatchCode())
                            .mfgDate(LocalDate.now())
                            .expiryDate(batchReq.getExpiryDate() != null && !batchReq.getExpiryDate().isBlank()
                                    ? LocalDate.parse(batchReq.getExpiryDate())
                                    : null)
                            .costPrice(itemReq.getUnitPrice())
                            .build();
                    productBatchRepository.save(batch);

                    // Update inventory stock
                    if (locationId != null) {
                        updateInventoryStock(variant, batch, batchReq.getQuantity(), locationId);
                    }
                }
            } else {
                // No batch data - create a default batch
                ProductVariant variant = resolveVariant(itemReq);
                String defaultBatchCode = "BATCH-" + savedOrder.getPoNumber() + "-" + System.currentTimeMillis();
                ProductBatch batch = ProductBatch.builder()
                        .variant(variant)
                        .batchNumber(defaultBatchCode)
                        .mfgDate(LocalDate.now())
                        .costPrice(itemReq.getUnitPrice())
                        .build();
                productBatchRepository.save(batch);

                if (locationId != null) {
                    updateInventoryStock(variant, batch, itemReq.getQuantity(), locationId);
                }
            }
        }
    }

    private ProductVariant resolveVariant(PurchaseOrderItemRequest itemReq) {
        if (itemReq.getVariantId() != null) {
            return productVariantRepository.findById(itemReq.getVariantId().longValue())
                    .orElseThrow(() -> new RuntimeException("Phiên bản sản phẩm không tồn tại."));
        } else if (itemReq.getProductId() != null) {
            Product product = productRepository.findById(itemReq.getProductId().longValue())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại."));
            List<ProductVariant> variants = product.getVariants();
            if (variants != null && !variants.isEmpty()) {
                return variants.get(0);
            }
            throw new RuntimeException("Sản phẩm chưa có phiên bản.");
        }
        throw new RuntimeException("Thiếu thông tin sản phẩm.");
    }

    private void updateInventoryStock(ProductVariant variant, ProductBatch batch, Integer quantity, Integer locationId) {
        // Find a shelf bin in the given location
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Vị trí kho không tồn tại."));

        List<ShelfBin> bins = location.getShelfBins();
        ShelfBin targetBin;
        if (bins != null && !bins.isEmpty()) {
            targetBin = bins.get(0); // Use first bin in the location
        } else {
            // Create a default bin
            targetBin = ShelfBin.builder()
                    .location(location)
                    .binCode("DEFAULT-" + location.getName())
                    .build();
            shelfBinRepository.save(targetBin);
        }

        // Create or update inventory stock
        InventoryStock stock = InventoryStock.builder()
                .variant(variant)
                .batch(batch)
                .bin(targetBin)
                .quantity(quantity)
                .build();
        inventoryStockRepository.save(stock);
    }

    // ─── Validation ──────────────────────────────────────────

    private void validateDraft(PurchaseOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Phiếu nhập phải có ít nhất 1 sản phẩm.");
        }
        for (PurchaseOrderItemRequest item : request.getItems()) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng sản phẩm \"" + item.getName() + "\" phải > 0.");
            }
        }
    }

    private void validateConfirm(PurchaseOrderRequest request) {
        validateDraft(request);
        if (request.getSupplierId() == null) {
            throw new RuntimeException("Vui lòng chọn nhà cung cấp trước khi xác nhận.");
        }
        if (request.getLocationId() == null) {
            throw new RuntimeException("Vui lòng chọn vị trí nhập kho.");
        }
    }

    // ─── Mappers ─────────────────────────────────────────────

    private PurchaseOrderResponse toListResponse(PurchaseOrder order) {
        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .poNumber(order.getPoNumber())
                .supplierId(order.getSupplier() != null ? order.getSupplier().getId() : null)
                .supplierName(order.getSupplier() != null ? order.getSupplier().getName() : "")
                .locationId(order.getLocation() != null ? order.getLocation().getId() : null)
                .locationName(order.getLocation() != null ? order.getLocation().getName() : "")
                .status(order.getStatus())
                .orderDate(order.getOrderDate())
                .createdAt(order.getCreatedAt())
                .confirmedAt(order.getConfirmedAt())
                .totalAmount(order.getTotalAmount())
                .subtotal(order.getSubtotal())
                .discount(order.getDiscount())
                .taxPercent(order.getTaxPercent())
                .taxAmount(order.getTaxAmount())
                .shippingFee(order.getShippingFee())
                .paidAmount(order.getPaidAmount())
                .remainingAmount(order.getRemainingAmount())
                .notes(order.getNotes())
                .receivedByName(order.getReceivedBy() != null ? order.getReceivedBy().getFullName() : null)
                .build();
    }

    private PurchaseOrderResponse toDetailResponse(PurchaseOrder order) {
        PurchaseOrderResponse response = toListResponse(order);

        // Include items
        if (order.getItems() != null) {
            List<PurchaseOrderItemResponse> itemResponses = order.getItems().stream()
                    .map(item -> PurchaseOrderItemResponse.builder()
                            .id(item.getId())
                            .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                            .productId(item.getVariant() != null && item.getVariant().getProduct() != null
                                    ? item.getVariant().getProduct().getId() : null)
                            .sku(item.getVariant() != null ? item.getVariant().getSku() : "")
                            .name(item.getVariant() != null && item.getVariant().getProduct() != null
                                    ? item.getVariant().getProduct().getName() : "")
                            .imageUrl(item.getVariant() != null ? item.getVariant().getImageUrl() : null)
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .discount(BigDecimal.ZERO)
                            .total(item.getUnitPrice() != null && item.getQuantity() != null
                                    ? item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                                    : BigDecimal.ZERO)
                            .build())
                    .collect(Collectors.toList());
            response.setItems(itemResponses);
        } else {
            response.setItems(new ArrayList<>());
        }

        return response;
    }
}

