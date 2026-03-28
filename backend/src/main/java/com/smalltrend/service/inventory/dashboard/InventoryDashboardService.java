package com.smalltrend.service.inventory.dashboard;

import com.smalltrend.dto.inventory.purchase.*;
import com.smalltrend.dto.inventory.count.*;
import com.smalltrend.dto.inventory.location.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.entity.*;
import com.smalltrend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryDashboardService {

    private static final int DEFAULT_MIN_STOCK = 50;

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    // ─── Products (flat shape for Dashboard) ──────────────
    public List<DashboardProductResponse> getAllProductsForDashboard() {
        List<ProductVariant> variants = productVariantRepository.findAll();
        List<InventoryStock> allStocks = inventoryStockRepository.findAll();

        Map<Integer, Integer> stockByVariantId = allStocks.stream()
                .filter(stock -> stock.getVariant() != null && stock.getVariant().getId() != null)
                .collect(Collectors.groupingBy(
                        stock -> stock.getVariant().getId(),
                        Collectors.summingInt(stock -> stock.getQuantity() != null ? stock.getQuantity() : 0)
                ));

        log.debug("Dashboard: {} variants, {} inventory stock rows", variants.size(), allStocks.size());

        return variants.stream().map(variant -> {
            Product product = variant.getProduct();
            Integer variantId = variant.getId();
            int totalStock = stockByVariantId.getOrDefault(variantId, 0);

            BigDecimal purchasePrice = resolvePurchasePrice(variant, allStocks);
            BigDecimal retailPrice = variant.getSellPrice() != null ? variant.getSellPrice() : BigDecimal.ZERO;
            String imageUrl = variant.getImageUrl() != null ? variant.getImageUrl() : (product != null ? product.getImageUrl() : null);

            return DashboardProductResponse.builder()
                    .id(variantId)
                    .sku(variant.getSku() != null ? variant.getSku() : "")
                    .name(buildVariantDisplayName(variant))
                    .description(product != null ? product.getDescription() : null)
                    .imageUrl(imageUrl)
                    .unit(variant.getUnit() != null && variant.getUnit().getName() != null ? variant.getUnit().getName() : "")
                    .isActive(variant.isActive())
                    .purchasePrice(purchasePrice)
                    .retailPrice(retailPrice)
                    .stockQuantity(totalStock)
                    .minStock(DEFAULT_MIN_STOCK)
                    .categoryId(product != null && product.getCategory() != null ? product.getCategory().getId() : null)
                    .categoryName(product != null && product.getCategory() != null ? product.getCategory().getName() : null)
                    .brandId(product != null && product.getBrand() != null ? product.getBrand().getId() : null)
                    .brandName(product != null && product.getBrand() != null ? product.getBrand().getName() : null)
                    .attributes(variant.getAttributes())
                    .build();
        }).collect(Collectors.toList());
    }

    private BigDecimal resolvePurchasePrice(ProductVariant variant, List<InventoryStock> allStocks) {
        if (variant == null || variant.getId() == null) {
            return BigDecimal.ZERO;
        }

        for (InventoryStock stock : allStocks) {
            if (stock.getVariant() == null || stock.getVariant().getId() == null) {
                continue;
            }
            if (!stock.getVariant().getId().equals(variant.getId())) {
                continue;
            }
            if (stock.getBatch() != null && stock.getBatch().getCostPrice() != null) {
                return stock.getBatch().getCostPrice();
            }
        }

        if (variant.getProductBatches() != null) {
            return variant.getProductBatches().stream()
                    .map(ProductBatch::getCostPrice)
                    .filter(price -> price != null)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);
        }

        return BigDecimal.ZERO;
    }

    private String buildVariantDisplayName(ProductVariant variant) {
        if (variant == null) {
            return "Unknown";
        }

        String baseName = variant.getProduct() != null && variant.getProduct().getName() != null
                ? variant.getProduct().getName()
                : "Unknown";

        Map<String, String> attributes = variant.getAttributes();
        if (attributes == null || attributes.isEmpty()) {
            return baseName;
        }

        String attrText = attributes.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> entry.getValue().trim())
                .collect(Collectors.joining(" · "));

        if (attrText.isBlank()) {
            return baseName;
        }

        return baseName + " - " + attrText;
    }

    // ─── Categories ──────────────────────────────────────
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── Brands ──────────────────────────────────────────
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(b -> BrandResponse.builder()
                        .id(b.getId())
                        .name(b.getName())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── Dashboard Summary ──────────────────────────────
    public DashboardSummaryResponse getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(30);

        List<InventoryStock> allStocks = inventoryStockRepository.findAll();
        List<ProductVariant> allVariants = productVariantRepository.findAll();

        Map<Integer, Integer> stockByVariantId = allStocks.stream()
                .filter(stock -> stock.getVariant() != null && stock.getVariant().getId() != null)
                .collect(Collectors.groupingBy(
                        stock -> stock.getVariant().getId(),
                        Collectors.summingInt(stock -> stock.getQuantity() != null ? stock.getQuantity() : 0)
                ));

        int totalVariants = 0;
        int lowStockCount = 0;
        for (ProductVariant variant : allVariants) {
            if (variant.getId() == null) {
                continue;
            }

            int variantStock = stockByVariantId.getOrDefault(variant.getId(), 0);
            if (variantStock > 0) {
                totalVariants++;
            }
            if (variantStock > 0 && variantStock <= DEFAULT_MIN_STOCK) {
                lowStockCount++;
            }
        }

        BigDecimal totalValue = allStocks.stream()
                .map(stock -> {
                    BigDecimal cost = stock.getBatch() != null && stock.getBatch().getCostPrice() != null
                            ? stock.getBatch().getCostPrice()
                            : BigDecimal.ZERO;
                    int qty = stock.getQuantity() != null ? stock.getQuantity() : 0;
                    return cost.multiply(BigDecimal.valueOf(qty));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int expiredCount = productBatchRepository.findExpiredBatches(today).size();
        int expiringSoonCount = productBatchRepository.findExpiringSoonBatches(today, futureDate).size();
        int needActionCount = lowStockCount + expiredCount;

        log.debug("Dashboard summary (variant-level): totalVariants={}, totalValue={}, lowStock={}, expired={}, expiring={}",
                totalVariants, totalValue, lowStockCount, expiredCount, expiringSoonCount);

        return DashboardSummaryResponse.builder()
                .totalProducts(totalVariants)
                .totalInventoryValue(totalValue)
                .lowStockCount(lowStockCount)
                .expiredBatchCount(expiredCount)
                .expiringSoonCount(expiringSoonCount)
                .needActionCount(needActionCount)
                .build();
    }

    // ─── Batch Status ──────────────────────────────────
    public List<BatchStatusResponse> getBatchStatuses() {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(30);
        List<ProductBatch> batches = productBatchRepository.findAllWithDetails();
        List<InventoryStock> allStocks = inventoryStockRepository.findAll();

        return batches.stream()
            .filter(batch -> {
                int qty = allStocks.stream()
                    .filter(s -> s.getBatch() != null && s.getBatch().getId().equals(batch.getId()))
                    .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                    .sum();
                return qty > 0 && batch.getExpiryDate() != null;
            })
            .map(batch -> {
                List<InventoryStock> stocksForBatch = allStocks.stream()
                    .filter(s -> s.getBatch() != null && s.getBatch().getId().equals(batch.getId()))
                    .collect(Collectors.toList());

                int qty = stocksForBatch.stream()
                    .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                    .sum();

                String locationName = stocksForBatch.stream()
                    .map(InventoryStock::getLocation)
                    .filter(location -> location != null && location.getName() != null && !location.getName().isBlank())
                    .map(Location::getName)
                    .distinct()
                    .collect(Collectors.joining(", "));

                String locationCode = stocksForBatch.stream()
                    .map(InventoryStock::getLocation)
                    .filter(location -> location != null && location.getLocationCode() != null && !location.getLocationCode().isBlank())
                    .map(Location::getLocationCode)
                    .distinct()
                    .collect(Collectors.joining(", "));

                LocalDate expiryDate = batch.getExpiryDate();
                long daysUntil = ChronoUnit.DAYS.between(today, expiryDate);

                String status;
                if (expiryDate.isBefore(today)) {
                    status = "EXPIRED";
                } else if (expiryDate.isBefore(futureDate)) {
                    status = "EXPIRING_SOON";
                } else {
                    status = "SAFE";
                }

                BigDecimal cost = batch.getCostPrice() != null ? batch.getCostPrice() : BigDecimal.ZERO;
                BigDecimal value = cost.multiply(BigDecimal.valueOf(qty));

                String productName = batch.getVariant() != null && batch.getVariant().getProduct() != null ?
                    batch.getVariant().getProduct().getName() : "Unknown";

                return BatchStatusResponse.builder()
                    .batchId(batch.getId())
                    .batchCode(batch.getBatchNumber())
                    .productName(productName)
                    .quantity(qty)
                    .expiryDate(expiryDate)
                    .status(status)
                    .daysUntilExpiry((int) daysUntil)
                    .value(value)
                    .receivedDate(batch.getMfgDate())
                    .locationName(locationName)
                    .locationCode(locationCode)
                    .build();
            })
            .collect(Collectors.toList());
    }

    // ─── Product Batches ──────────────────────────────────
    public List<ProductBatchResponse> getProductBatches() {
        List<ProductBatch> batches = productBatchRepository.findAllWithDetails();
        List<InventoryStock> allStocks = inventoryStockRepository.findAll();

        return batches.stream()
            .map(batch -> {
                int qty = allStocks.stream()
                    .filter(s -> s.getBatch() != null && s.getBatch().getId().equals(batch.getId()))
                    .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                    .sum();

                Integer productId = batch.getVariant() != null && batch.getVariant().getProduct() != null ?
                    batch.getVariant().getProduct().getId() : null;
                String productName = batch.getVariant() != null && batch.getVariant().getProduct() != null ?
                    batch.getVariant().getProduct().getName() : "Unknown";

                return ProductBatchResponse.builder()
                    .id(batch.getId())
                    .batchCode(batch.getBatchNumber())
                    .productId(productId)
                    .productName(productName)
                    .quantity(qty)
                    .expiryDate(batch.getExpiryDate())
                    .receivedDate(batch.getMfgDate())
                    .costPrice(batch.getCostPrice())
                    .build();
            })
            .collect(Collectors.toList());
    }

    // ─── Recent Activities ──────────────────────────────
    public List<RecentActivityResponse> getRecentActivities() {
        List<RecentActivityResponse> activities = new ArrayList<>();

        // Get recent purchase orders as "IN" activities
        List<PurchaseOrder> recentOrders = purchaseOrderRepository.findAll();
        for (PurchaseOrder po : recentOrders) {
            if (po.getStatus() != null) {
                String type = "IN";
                int totalQty = 0;
                if (po.getItems() != null) {
                    totalQty = po.getItems().stream()
                        .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                        .sum();
                }
                activities.add(RecentActivityResponse.builder()
                    .type(type)
                    .productName("PO " + (po.getOrderNumber() != null ? po.getOrderNumber() : "#" + po.getId()))
                    .quantity(totalQty)
                    .referenceType("PurchaseOrder")
                    .referenceCode(po.getOrderNumber())
                    .createdAt(po.getCreatedAt())
                    .build());
            }
        }

        // Sort by createdAt DESC, limit to 10
        activities.sort(Comparator.comparing(
            RecentActivityResponse::getCreatedAt,
            Comparator.nullsLast(Comparator.reverseOrder())
        ));

        return activities.stream().limit(10).collect(Collectors.toList());
    }
}
