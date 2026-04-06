package com.smalltrend.service.products;

import com.smalltrend.dto.products.UnitConversionRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.Unit;
import com.smalltrend.entity.UnitConversion;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitConversionService {

    private final UnitConversionRepository unitConversionRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UnitRepository unitRepository;
    private final ProductVariantService productVariantService;
    private final InventoryStockRepository inventoryStockRepository;
    private final ProductBatchRepository productBatchRepository;

    public List<UnitConversionResponse> getConversionsByVariantId(Integer variantId) {
        return unitConversionRepository.findByVariantId(variantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Thêm quy đổi đơn vị MỚI cho một variant.
     *
     * Khi tạo quy đổi (VD: 6 Lon = 1 Lốc), hệ thống sẽ TỰ ĐỘNG: 1. Tạo một
     * product variant mới với đơn vị đích (Lốc) 2. Sinh mã SKU tự động (VD:
     * BEV-COCA-COLA-LOC6) 3. Sinh mã barcode nội bộ (20 + ProductID + VariantID
     * + Random) 4. Lưu quy đổi và liên kết với variant gốc
     *
     * Đây là hành vi chuẩn của hệ thống POS siêu thị: packaging units tự động
     * trở thành variants riêng biệt.
     */
    @Transactional
    public UnitConversionResponse addConversion(Integer variantId, UnitConversionRequest request) {
        ProductVariant baseVariant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy biến thể với ID: " + variantId));

        Integer productId = baseVariant.getProduct() != null ? baseVariant.getProduct().getId() : null;
        Integer unitId = baseVariant.getUnit() != null ? baseVariant.getUnit().getId() : null;

        if (productId != null && unitId != null) {
            List<UnitConversion> conversionsToThisUnit = unitConversionRepository.findByProductIdAndToUnitId(productId, unitId);
            boolean isConversionDerivedVariant = conversionsToThisUnit.stream()
                    .filter(conversion -> conversion != null
                            && conversion.getVariant() != null
                            && conversion.getVariant().getId() != null
                            && !conversion.getVariant().getId().equals(baseVariant.getId()))
                    .anyMatch(conversion -> hasSameAttributes(conversion.getVariant(), baseVariant));

            if (isConversionDerivedVariant) {
                throw new RuntimeException("Chỉ biến thể đơn vị gốc mới được phép thêm quy đổi đơn vị.");
            }
        }

        Unit toUnit = unitRepository.findById(request.getToUnitId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đơn vị với ID: " + request.getToUnitId()));

        if (unitConversionRepository.existsByVariantIdAndToUnitId(variantId, request.getToUnitId())) {
            throw new RuntimeException(
                    "Quy đổi sang đơn vị '" + toUnit.getName() + "' đã tồn tại cho biến thể này!");
        }

        Product product = baseVariant.getProduct();

        BigDecimal resolvedSellPrice = request.getSellPrice();

        // ─── 1. Tạo quy đổi đơn vị ────────────────────────────────────────────
        UnitConversion conversion = UnitConversion.builder()
                .variant(baseVariant)
                .toUnit(toUnit)
                .conversionFactor(request.getConversionFactor())
                .sellPrice(resolvedSellPrice)
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        UnitConversion savedConversion = unitConversionRepository.save(conversion);

        // ─── 2. Tự động tạo Product Variant mới cho đơn vị đóng gói ───────────
        String autoSku = productVariantService.generateSkuForConversion(
                baseVariant, toUnit, request.getConversionFactor());

        ProductVariant packagingVariant = ProductVariant.builder()
                .product(product)
                .sku(autoSku)
                .unit(toUnit)
                .sellPrice(resolvedSellPrice)
                .isActive(baseVariant.isActive())
                .attributes(baseVariant.getAttributes() != null
                        ? new java.util.HashMap<>(baseVariant.getAttributes())
                        : new java.util.HashMap<>())
                .build();

        ProductVariant savedVariant = productVariantRepository.saveAndFlush(packagingVariant);

        // ─── 3. Sinh barcode nội bộ ──────
        String autoBarcode = productVariantService.generateInternalBarcodeForPackaging(
                product.getId(), savedVariant.getId());
        savedVariant.setBarcode(autoBarcode);

        // ─── 3.1. Chia sẻ tồn kho từ base variant sang variant đóng gói ───────
        List<InventoryStock> baseStocks = inventoryStockRepository.findByVariantId(baseVariant.getId());
        if (baseStocks != null && !baseStocks.isEmpty()
                && request.getConversionFactor() != null
                && request.getConversionFactor().compareTo(java.math.BigDecimal.ZERO) > 0) {
            for (InventoryStock baseStock : baseStocks) {
                Integer baseQty = baseStock.getQuantity() != null ? baseStock.getQuantity() : 0;
                int packagingQty = java.math.BigDecimal.valueOf(baseQty)
                        .divide(request.getConversionFactor(), 0, RoundingMode.DOWN)
                        .intValue();

                if (packagingQty <= 0) {
                    continue;
                }

                ProductBatch sourceBatch = baseStock.getBatch();
                ProductBatch newBatch = ProductBatch.builder()
                        .variant(savedVariant)
                        .batchNumber(sourceBatch != null ? sourceBatch.getBatchNumber() : null)
                        .mfgDate(sourceBatch != null ? sourceBatch.getMfgDate() : LocalDate.now())
                        .expiryDate(sourceBatch != null ? sourceBatch.getExpiryDate() : LocalDate.now().plusYears(1))
                        .costPrice(sourceBatch != null ? sourceBatch.getCostPrice() : null)
                        .build();
                ProductBatch savedBatch = productBatchRepository.save(newBatch);

                InventoryStock packagedStock = InventoryStock.builder()
                        .variant(savedVariant)
                        .batch(savedBatch)
                        .location(baseStock.getLocation())
                        .quantity(packagingQty)
                        .build();
                inventoryStockRepository.save(packagedStock);
            }
        }

        // ─── 4. Trả về response kèm thông tin variant tự động tạo ─────────────
        UnitConversionResponse response = mapToResponse(savedConversion);
        response.setAutoCreatedVariantId(savedVariant.getId());
        response.setAutoCreatedSku(savedVariant.getSku());
        response.setAutoCreatedBarcode(savedVariant.getBarcode());

        return response;
    }

    public UnitConversionResponse updateConversion(Integer conversionId, UnitConversionRequest request) {
        UnitConversion conversion = unitConversionRepository.findById(conversionId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy quy đổi với ID: " + conversionId));

        Unit toUnit = unitRepository.findById(request.getToUnitId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đơn vị với ID: " + request.getToUnitId()));

        if (unitConversionRepository.existsByVariantIdAndToUnitIdAndIdNot(
                conversion.getVariant().getId(), request.getToUnitId(), conversionId)) {
            throw new RuntimeException(
                    "Quy đổi sang đơn vị '" + toUnit.getName() + "' đã tồn tại cho biến thể này!");
        }

        BigDecimal resolvedSellPrice = request.getSellPrice() != null
                ? request.getSellPrice()
                : conversion.getSellPrice();

        conversion.setToUnit(toUnit);
        conversion.setConversionFactor(request.getConversionFactor());
        conversion.setSellPrice(resolvedSellPrice);
        conversion.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            conversion.setActive(request.getIsActive());
        }

        UnitConversion saved = unitConversionRepository.save(conversion);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteConversion(Integer conversionId) {
        UnitConversion conversion = unitConversionRepository.findById(conversionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quy đổi với ID: " + conversionId));

        Integer productId = conversion.getVariant().getProduct().getId();
        Integer toUnitId = conversion.getToUnit().getId();

        unitConversionRepository.deleteById(conversionId);

        List<ProductVariant> autoVariants = productVariantRepository.findByProductIdAndUnitId(productId, toUnitId);
        if (autoVariants != null && !autoVariants.isEmpty()) {
            for (ProductVariant v : autoVariants) {
                productVariantService.deleteVariant(v.getId());
            }
        }
    }

    public UnitConversionResponse mapToResponse(UnitConversion entity) {
        UnitConversionResponse response = new UnitConversionResponse();
        response.setId(entity.getId());
        response.setVariantId(entity.getVariant().getId());
        response.setToUnitId(entity.getToUnit().getId());
        response.setToUnitName(entity.getToUnit().getName());
        response.setToUnitCode(entity.getToUnit().getCode());
        response.setConversionFactor(entity.getConversionFactor());
        response.setSellPrice(entity.getSellPrice());
        response.setDescription(entity.getDescription());
        response.setIsActive(entity.isActive());
        return response;
    }

    private boolean hasSameAttributes(ProductVariant left, ProductVariant right) {
        Map<String, String> leftAttrs = left != null && left.getAttributes() != null ? left.getAttributes() : Collections.emptyMap();
        Map<String, String> rightAttrs = right != null && right.getAttributes() != null ? right.getAttributes() : Collections.emptyMap();
        return leftAttrs.equals(rightAttrs);
    }
}
