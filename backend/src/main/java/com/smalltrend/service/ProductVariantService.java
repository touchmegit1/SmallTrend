package com.smalltrend.service;

import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.repository.UnitRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.Unit;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.dto.pos.ProductVariantRespone;
import com.smalltrend.dto.products.CreateVariantRequest;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final ProductBatchRepository productBatchRepository;

    public List<ProductVariantRespone> getAllProductVariants(String search, String barcode) {
        List<ProductVariant> variants;

        if (barcode != null && !barcode.isEmpty()) {
            variants = productVariantRepository.findAll().stream()
                    .filter(v -> v.getBarcode() != null && v.getBarcode().contains(barcode))
                    .collect(Collectors.toList());
        } else if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            variants = productVariantRepository.findAll().stream()
                    .filter(v -> (v.getProduct().getName() != null
                            && v.getProduct().getName().toLowerCase().contains(searchLower)) ||
                            (v.getSku() != null && v.getSku().toLowerCase().contains(searchLower)) ||
                            (v.getBarcode() != null && v.getBarcode().contains(search)))
                    .collect(Collectors.toList());
        } else {
            variants = productVariantRepository.findAll();
        }

        return variants.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductVariantRespone> getVariantsByProductId(Integer productId) {
        List<ProductVariant> variants = productVariantRepository.findAll().stream()
                .filter(v -> v.getProduct().getId().equals(productId))
                .collect(Collectors.toList());

        return variants.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductVariantRespone createVariant(Integer productId, CreateVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + request.getUnitId()));

        boolean isVariantActive = request.getIsActive() != null ? request.getIsActive() : true;
        if (isVariantActive && (product.getIsActive() != null && !product.getIsActive())) {
            throw new RuntimeException("Không thể tạo biến thể đang bán vì sản phẩm gốc đang ngừng bán!");
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(request.getSku())
                .barcode(request.getBarcode())
                .unit(unit)
                .unitValue(request.getUnitValue())
                .sellPrice(request.getSellPrice())
                .imageUrl(request.getImageUrl())
                .isActive(isVariantActive)
                .build();

        ProductVariant saved = productVariantRepository.save(variant);
        return mapToResponse(saved);
    }

    public ProductVariantRespone updateVariant(Integer variantId, CreateVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + request.getUnitId()));

        variant.setSku(request.getSku());
        variant.setBarcode(request.getBarcode());
        variant.setUnit(unit);
        variant.setUnitValue(request.getUnitValue());
        variant.setSellPrice(request.getSellPrice());
        if (request.getImageUrl() != null) {
            variant.setImageUrl(request.getImageUrl());
        }
        if (request.getIsActive() != null) {
            if (request.getIsActive()
                    && (variant.getProduct().getIsActive() != null && !variant.getProduct().getIsActive())) {
                throw new RuntimeException("Không thể bật trạng thái hoạt động vì sản phẩm gốc đang ngừng bán!");
            }
            variant.setActive(request.getIsActive());
        }

        ProductVariant saved = productVariantRepository.save(variant);
        return mapToResponse(saved);
    }

    public void toggleVariantStatus(Integer variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        boolean willBeActive = !variant.isActive();
        if (willBeActive && (variant.getProduct().getIsActive() != null && !variant.getProduct().getIsActive())) {
            throw new RuntimeException("Không thể bật trạng thái hoạt động vì sản phẩm gốc đang ngừng bán!");
        }

        variant.setActive(willBeActive);
        productVariantRepository.save(variant);
    }

    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    private ProductVariantRespone mapToResponse(ProductVariant variant) {
        ProductVariantRespone response = new ProductVariantRespone();
        response.setId(variant.getId());
        response.setSku(variant.getSku());
        response.setBarcode(variant.getBarcode());
        // Build variant name: Product name + unitValue + Unit name
        // Example: "Dove Soap - 90 Gram"
        String productName = variant.getProduct().getName();
        String unitName = variant.getUnit() != null ? variant.getUnit().getName() : null;
        java.math.BigDecimal unitValue = variant.getUnitValue();

        StringBuilder nameBuilder = new StringBuilder(productName);
        if (unitValue != null || (unitName != null && !unitName.isEmpty())) {
            nameBuilder.append(" - ");
            if (unitValue != null) {
                if (unitValue.stripTrailingZeros().scale() <= 0) {
                    nameBuilder.append(unitValue.toBigInteger().toString());
                } else {
                    nameBuilder.append(unitValue.stripTrailingZeros().toPlainString());
                }
                if (unitName != null && !unitName.isEmpty()) {
                    nameBuilder.append(" ");
                }
            }
            if (unitName != null && !unitName.isEmpty()) {
                nameBuilder.append(unitName);
            }
        }
        response.setName(nameBuilder.toString());
        response.setUnitName(unitName);
        if (variant.getUnit() != null) {
            response.setUnitId(variant.getUnit().getId());
        }
        response.setUnitValue(variant.getUnitValue());
        response.setImageUrl(variant.getImageUrl());
        response.setSellPrice(variant.getSellPrice());
        response.setIsActive(variant.isActive());

        // Get stock quantity
        Integer stockQty = inventoryStockRepository.findByVariantId(variant.getId())
                .stream()
                .mapToInt(InventoryStock::getQuantity)
                .sum();
        response.setStockQuantity(stockQty);

        // Get cost price from latest batch
        List<ProductBatch> batches = productBatchRepository.findByVariantId(variant.getId());
        if (batches != null && !batches.isEmpty()) {
            // Get the latest batch's cost price
            ProductBatch latestBatch = batches.get(batches.size() - 1);
            response.setCostPrice(latestBatch.getCostPrice());
        }

        // Get category and brand names
        if (variant.getProduct().getCategory() != null) {
            response.setCategoryName(variant.getProduct().getCategory().getName());
        }
        if (variant.getProduct().getBrand() != null) {
            response.setBrandName(variant.getProduct().getBrand().getName());
        }

        return response;
    }
}
