package com.smalltrend.service;

import com.smalltrend.dto.products.UnitConversionRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Unit;
import com.smalltrend.entity.UnitConversion;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.repository.UnitRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
         * Khi tạo quy đổi (VD: 6 Lon = 1 Lốc), hệ thống sẽ TỰ ĐỘNG:
         * 1. Tạo một product variant mới với đơn vị đích (Lốc)
         * 2. Sinh mã SKU tự động (VD: BEV-COCA-COLA-LOC6)
         * 3. Sinh mã barcode nội bộ (20 + ProductID + VariantID + Random)
         * 4. Lưu quy đổi và liên kết với variant gốc
         *
         * Đây là hành vi chuẩn của hệ thống POS siêu thị:
         * packaging units tự động trở thành variants riêng biệt.
         */
        @Transactional
        public UnitConversionResponse addConversion(Integer variantId, UnitConversionRequest request) {
                ProductVariant baseVariant = productVariantRepository.findById(variantId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Không tìm thấy biến thể với ID: " + variantId));

                Unit toUnit = unitRepository.findById(request.getToUnitId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Không tìm thấy đơn vị với ID: " + request.getToUnitId()));

                if (unitConversionRepository.existsByVariantIdAndToUnitId(variantId, request.getToUnitId())) {
                        throw new RuntimeException(
                                        "Quy đổi sang đơn vị '" + toUnit.getName() + "' đã tồn tại cho biến thể này!");
                }

                Product product = baseVariant.getProduct();

                // ─── 1. Tạo quy đổi đơn vị ────────────────────────────────────────────
                UnitConversion conversion = UnitConversion.builder()
                                .variant(baseVariant)
                                .toUnit(toUnit)
                                .conversionFactor(request.getConversionFactor())
                                .sellPrice(request.getSellPrice())
                                .description(request.getDescription())
                                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                                .build();

                UnitConversion savedConversion = unitConversionRepository.save(conversion);

                // ─── 2. Tự động tạo Product Variant mới cho đơn vị đóng gói ───────────
                // Sinh SKU: VD BEV-COCA-COLA-LOC6
                String autoSku = productVariantService.generateSkuForConversion(
                                baseVariant, toUnit, request.getConversionFactor());

                // Tạo variant mới với đơn vị đích
                ProductVariant packagingVariant = ProductVariant.builder()
                                .product(product)
                                .sku(autoSku)
                                .unit(toUnit)
                                .sellPrice(request.getSellPrice())
                                .isActive(baseVariant.isActive())
                                .imageUrl(baseVariant.getImageUrl()) // Kế thừa ảnh từ variant gốc
                                .attributes(baseVariant.getAttributes() != null
                                                ? new java.util.HashMap<>(baseVariant.getAttributes())
                                                : null) // Kế thừa thuộc tính
                                .build();

                ProductVariant savedVariant = productVariantRepository.save(packagingVariant);

                // ─── 3. Sinh barcode nội bộ (20 + ProductID + VariantID + Random) ──────
                String autoBarcode = productVariantService.generateInternalBarcodeForPackaging(
                                product.getId(), savedVariant.getId());
                savedVariant.setBarcode(autoBarcode);
                productVariantRepository.save(savedVariant);

                // ─── 4. Chia sẻ tồn kho từ variant gốc cho variant quy đổi ─────────────
                // Lấy tất cả inventory stock của variant gốc
                List<InventoryStock> baseStocks = inventoryStockRepository.findByVariantId(baseVariant.getId());
                int conversionFactor = request.getConversionFactor().intValue();

                if (baseStocks != null && !baseStocks.isEmpty()) {
                        for (InventoryStock baseStock : baseStocks) {
                                if (baseStock.getQuantity() != null && baseStock.getQuantity() > 0
                                                && conversionFactor > 0) {
                                        // Tính tồn kho cho đơn vị quy đổi = tồn kho gốc / hệ số
                                        int convertedQty = baseStock.getQuantity() / conversionFactor;

                                        if (convertedQty > 0) {
                                                // Tạo batch cho variant quy đổi (kế thừa từ batch gốc)
                                                ProductBatch packagingBatch = ProductBatch.builder()
                                                                .variant(savedVariant)
                                                                .batchNumber("CONV-" + savedVariant.getSku())
                                                                .costPrice(baseStock.getBatch() != null
                                                                                ? baseStock.getBatch().getCostPrice()
                                                                                : null)
                                                                .mfgDate(baseStock.getBatch() != null
                                                                                ? baseStock.getBatch().getMfgDate()
                                                                                : null)
                                                                .expiryDate(baseStock.getBatch() != null
                                                                                ? baseStock.getBatch().getExpiryDate()
                                                                                : null)
                                                                .build();
                                                ProductBatch savedBatch = productBatchRepository.save(packagingBatch);

                                                // Tạo inventory stock cho variant quy đổi
                                                InventoryStock packagingStock = InventoryStock.builder()
                                                                .variant(savedVariant)
                                                                .batch(savedBatch)
                                                                .location(baseStock.getLocation())
                                                                .quantity(convertedQty)
                                                                .build();
                                                inventoryStockRepository.save(packagingStock);
                                        }
                                }
                        }
                }

                // ─── 5. Trả về response kèm thông tin variant tự động tạo ─────────────
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

                // Check duplicate (excluding current record)
                if (unitConversionRepository.existsByVariantIdAndToUnitIdAndIdNot(
                                conversion.getVariant().getId(), request.getToUnitId(), conversionId)) {
                        throw new RuntimeException(
                                        "Quy đổi sang đơn vị '" + toUnit.getName() + "' đã tồn tại cho biến thể này!");
                }

                conversion.setToUnit(toUnit);
                conversion.setConversionFactor(request.getConversionFactor());
                conversion.setSellPrice(request.getSellPrice());
                conversion.setDescription(request.getDescription());
                if (request.getIsActive() != null) {
                        conversion.setActive(request.getIsActive());
                }

                UnitConversion saved = unitConversionRepository.save(conversion);
                return mapToResponse(saved);
        }

        @Transactional
        public void deleteConversion(Integer conversionId) {
                if (!unitConversionRepository.existsById(conversionId)) {
                        throw new RuntimeException("Không tìm thấy quy đổi với ID: " + conversionId);
                }
                unitConversionRepository.deleteById(conversionId);
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
}
