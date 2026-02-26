package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.inventorycount.*;
import com.smalltrend.dto.inventory.location.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.entity.*;
import com.smalltrend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryDashboardService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductBatchRepository productBatchRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    // ─── Products (flat shape for Dashboard) ──────────────
    public List<DashboardProductResponse> getAllProductsForDashboard() {
        List<Product> products = productRepository.findAll();

        return products.stream().map(product -> {
            // Get first variant for SKU / pricing info
            ProductVariant firstVariant = null;
            if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                firstVariant = product.getVariants().get(0);
            }

            // Calculate total stock from InventoryStock
            int totalStock = 0;
            if (product.getVariants() != null) {
                for (ProductVariant variant : product.getVariants()) {
                    if (variant.getInventoryStocks() != null) {
                        totalStock += variant.getInventoryStocks().stream()
                                .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                                .sum();
                    }
                }
            }

            // Get cost price from first batch of first variant
            BigDecimal purchasePrice = BigDecimal.ZERO;
            BigDecimal retailPrice = BigDecimal.ZERO;
            String sku = "";
            String unit = "";

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
                    .unit(unit)
                    .isActive(true)
                    .purchasePrice(purchasePrice)
                    .retailPrice(retailPrice)
                    .stockQuantity(totalStock)
                    .minStock(50) // default min stock
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

    // ─── Product Batches ─────────────────────────────────
    public List<ProductBatchResponse> getAllProductBatches() {
        return productBatchRepository.findAll().stream()
                .map(batch -> {
                    // Get product_id through variant -> product
                    Integer productId = null;
                    if (batch.getVariant() != null && batch.getVariant().getProduct() != null) {
                        productId = batch.getVariant().getProduct().getId();
                    }

                    // Sum quantity from inventory_stock for this batch
                    int qty = 0;
                    if (batch.getInventoryStocks() != null) {
                        qty = batch.getInventoryStocks().stream()
                                .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                                .sum();
                    }

                    return ProductBatchResponse.builder()
                            .id(batch.getId())
                            .batchCode(batch.getBatchNumber())
                            .productId(productId)
                            .quantity(qty)
                            .expiryDate(batch.getExpiryDate() != null ? batch.getExpiryDate().toString() : null)
                            .receivedDate(batch.getMfgDate() != null ? batch.getMfgDate().toString() : null)
                            .createdAt(batch.getMfgDate() != null ? batch.getMfgDate().toString() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ─── Stock Movements ─────────────────────────────────
    public List<StockMovementResponse> getAllStockMovements() {
        return stockMovementRepository.findAll().stream()
                .map(sm -> StockMovementResponse.builder()
                        .id(sm.getId())
                        .variantId(sm.getVariant() != null ? sm.getVariant().getId() : null)
                        .fromBinId(sm.getFromBin() != null ? sm.getFromBin().getId() : null)
                        .toBinId(sm.getToBin() != null ? sm.getToBin().getId() : null)
                        .quantity(sm.getQuantity())
                        .type(sm.getType())
                        .createdAt(null) // StockMovement entity doesn't have createdAt yet
                        .build())
                .collect(Collectors.toList());
    }
}

