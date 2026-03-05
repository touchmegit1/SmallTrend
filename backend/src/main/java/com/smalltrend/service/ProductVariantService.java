package com.smalltrend.service;

import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.repository.UnitRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.Unit;
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
        List<ProductVariant> variants = productVariantRepository.findByProductId(productId);

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

        if (request.getSku() != null && !request.getSku().trim().isEmpty()) {
            if (productVariantRepository.existsBySku(request.getSku())) {
                throw new RuntimeException("Mã SKU đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
            }
        }
        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            if (productVariantRepository.existsByBarcode(request.getBarcode())) {
                throw new RuntimeException("Mã Barcode đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
            }
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
                .attributes(request.getAttributes())
                .build();

        ProductVariant saved = productVariantRepository.save(variant);
        return mapToResponse(saved);
    }

    public ProductVariantRespone updateVariant(Integer variantId, CreateVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + request.getUnitId()));

        if (request.getSku() != null && !request.getSku().trim().isEmpty()) {
            if (productVariantRepository.existsBySkuAndIdNot(request.getSku(), variantId)) {
                throw new RuntimeException("Mã SKU đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
            }
        }
        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            if (productVariantRepository.existsByBarcodeAndIdNot(request.getBarcode(), variantId)) {
                throw new RuntimeException("Mã Barcode đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
            }
        }

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
        if (request.getAttributes() != null) {
            variant.setAttributes(request.getAttributes());
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

    public void deleteVariant(Integer variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        java.time.LocalDateTime createdAt = variant.getCreatedAt();
        if (createdAt != null) {
            long minutes = java.time.Duration.between(createdAt, java.time.LocalDateTime.now()).toMinutes();
            if (minutes >= 2) {
                throw new RuntimeException("Biến thể đã tạo quá 2 phút, bạn không thể xoá biến thể này nữa!");
            }
        }

        productVariantRepository.deleteById(variantId);
    }

    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    private ProductVariantRespone mapToResponse(ProductVariant variant) {
        ProductVariantRespone response = new ProductVariantRespone();
        response.setId(variant.getId());
        response.setSku(variant.getSku());
        response.setBarcode(variant.getBarcode());
        String productName = variant.getProduct() != null ? variant.getProduct().getName() : "";
        StringBuilder nameBuilder = new StringBuilder(productName);

        java.math.BigDecimal unitValue = variant.getUnitValue();
        String unitNameStr = variant.getUnit() != null ? variant.getUnit().getName() : "";

        if (unitValue != null || (unitNameStr != null && !unitNameStr.trim().isEmpty())) {
            nameBuilder.append(" - ");
            if (unitValue != null) {
                nameBuilder.append(unitValue.stripTrailingZeros().toPlainString());
            }
            if (unitNameStr != null && !unitNameStr.trim().isEmpty()) {
                nameBuilder.append(unitNameStr.trim());
            }
        }

        java.util.Map<String, String> attributes = variant.getAttributes();
        if (attributes != null && !attributes.isEmpty()) {
            for (String value : attributes.values()) {
                if (value != null && !value.trim().isEmpty()) {
                    nameBuilder.append(" - ").append(value.trim());
                }
            }
        }

        response.setName(nameBuilder.toString());
        String unitName = variant.getUnit() != null ? variant.getUnit().getName() : null;
        response.setUnitName(unitName);
        if (variant.getUnit() != null) {
            response.setUnitId(variant.getUnit().getId());
        }
        response.setUnitValue(variant.getUnitValue());
        response.setImageUrl(variant.getImageUrl());
        response.setSellPrice(variant.getSellPrice());
        response.setIsActive(variant.isActive());
        response.setAttributes(variant.getAttributes());
        response.setCreatedAt(variant.getCreatedAt());

        // Tax Info
        if (variant.getProduct() != null && variant.getProduct().getTaxRate() != null) {
            response.setTaxRate(variant.getProduct().getTaxRate().getRate());
            response.setTaxName(variant.getProduct().getTaxRate().getName());
        }

        // Get stock quantity
        Integer stockQty = inventoryStockRepository.findByVariantId(variant.getId())
                .stream()
                .mapToInt(stock -> stock.getQuantity() != null ? stock.getQuantity() : 0)
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
