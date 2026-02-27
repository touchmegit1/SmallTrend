package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.inventorycount.*;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryDashboardService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    // ─── Products (flat shape for Dashboard) ──────────────
    public List<DashboardProductResponse> getAllProductsForDashboard() {
        List<Product> products = productRepository.findAll();
        List<InventoryStock> allStocks = inventoryStockRepository.findAll();
        
        log.debug("📦 Dashboard: {} products, {} inventory stock rows", products.size(), allStocks.size());
        allStocks.forEach(s -> log.debug("  Stock: variant={}, batch={}, qty={}", 
            s.getVariant() != null ? s.getVariant().getId() : "null",
            s.getBatch() != null ? s.getBatch().getId() : "null",
            s.getQuantity()));

        return products.stream().map(product -> {
            ProductVariant firstVariant = null;
            if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                firstVariant = product.getVariants().get(0);
            }

            int totalStock = 0;
            if (product.getVariants() != null) {
                for (ProductVariant variant : product.getVariants()) {
                    totalStock += allStocks.stream()
                        .filter(s -> s.getVariant() != null && s.getVariant().getId().equals(variant.getId()))
                        .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                        .sum();
                }
            }

            BigDecimal purchasePrice = BigDecimal.ZERO;
            BigDecimal retailPrice = BigDecimal.ZERO;
            String sku = "";

            if (firstVariant != null) {
                sku = firstVariant.getSku() != null ? firstVariant.getSku() : "";
                retailPrice = firstVariant.getSellPrice() != null ? firstVariant.getSellPrice() : BigDecimal.ZERO;

                if (firstVariant.getProductBatches() != null && !firstVariant.getProductBatches().isEmpty()) {
                    purchasePrice = firstVariant.getProductBatches().get(0).getCostPrice();
                    if (purchasePrice == null) purchasePrice = BigDecimal.ZERO;
                }
            }

            return DashboardProductResponse.builder()
                    .id(product.getId())
                    .sku(sku)
                    .name(product.getName())
                    .description(product.getDescription())
                    .imageUrl(product.getImageUrl())
                    .unit("")
                    .isActive(true)
                    .purchasePrice(purchasePrice)
                    .retailPrice(retailPrice)
                    .stockQuantity(totalStock)
                    .minStock(50)
                    .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                    .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                    .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                    .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                    .build();
        }).collect(Collectors.toList());
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
        List<Product> allProducts = productRepository.findAll();
        
        // Total products with actual stock > 0
        int totalProducts = 0;
        for (Product product : allProducts) {
            if (product.getVariants() != null) {
                int productStock = 0;
                for (ProductVariant variant : product.getVariants()) {
                    productStock += allStocks.stream()
                        .filter(s -> s.getVariant() != null && s.getVariant().getId().equals(variant.getId()))
                        .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                        .sum();
                }
                if (productStock > 0) totalProducts++;
            }
        }
        
        // Total inventory value
        BigDecimal totalValue = allStocks.stream()
            .map(stock -> {
                BigDecimal cost = stock.getBatch() != null && stock.getBatch().getCostPrice() != null ? 
                    stock.getBatch().getCostPrice() : BigDecimal.ZERO;
                int qty = stock.getQuantity() != null ? stock.getQuantity() : 0;
                return cost.multiply(BigDecimal.valueOf(qty));
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Low stock count (products with stock <= 50)
        int lowStockCount = 0;
        for (Product product : allProducts) {
            if (product.getVariants() != null) {
                int productStock = 0;
                for (ProductVariant variant : product.getVariants()) {
                    productStock += allStocks.stream()
                        .filter(s -> s.getVariant() != null && s.getVariant().getId().equals(variant.getId()))
                        .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                        .sum();
                }
                if (productStock > 0 && productStock <= 50) lowStockCount++;
            }
        }
        
        // Expired batches
        int expiredCount = productBatchRepository.findExpiredBatches(today).size();
        
        // Expiring soon
        int expiringSoonCount = productBatchRepository.findExpiringSoonBatches(today, futureDate).size();
        
        // Need action
        int needActionCount = lowStockCount + expiredCount;
        
        log.debug("📊 Summary: totalProducts={}, totalValue={}, lowStock={}, expired={}, expiring={}", 
            totalProducts, totalValue, lowStockCount, expiredCount, expiringSoonCount);
        
        return DashboardSummaryResponse.builder()
            .totalProducts(totalProducts)
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
                int qty = allStocks.stream()
                    .filter(s -> s.getBatch() != null && s.getBatch().getId().equals(batch.getId()))
                    .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                    .sum();
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
                    .productName("PO " + (po.getPoNumber() != null ? po.getPoNumber() : "#" + po.getId()))
                    .quantity(totalQty)
                    .referenceType("PurchaseOrder")
                    .referenceCode(po.getPoNumber())
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