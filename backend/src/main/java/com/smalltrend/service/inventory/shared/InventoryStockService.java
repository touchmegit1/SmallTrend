package com.smalltrend.service.inventory.shared;

import com.smalltrend.dto.inventory.StockAdjustRequest;
import com.smalltrend.dto.inventory.StockImportRequest;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Location;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.StockMovement;
import com.smalltrend.entity.UnitConversion;
import com.smalltrend.entity.enums.StockTransactionType;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.LocationRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.StockMovementRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.validation.inventory.stock.InventoryStockRequestValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InventoryStockService {

    private final InventoryStockRepository inventoryStockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UnitConversionRepository unitConversionRepository;
    private final ProductBatchRepository productBatchRepository;
    private final LocationRepository locationRepository;
    private final InventoryOutOfStockNotificationService outOfStockNotificationService;
    private final InventoryStockRequestValidator inventoryStockRequestValidator;

    /**
     * Lấy tổng tồn kho của 1 variant (tính gộp các batch và location)
     */
    public int getTotalStockForVariant(Integer variantId) {
        return inventoryStockRepository.sumQuantityByVariantId(variantId);
    }

    /**
     * Nhập hàng vào kho (Import Stock)
     * Tự động tính toán quy đổi nếu nhập vào vỏ hộp (packaging unit)
     */
    @Transactional
    // Nhập stock.
    public void importStock(StockImportRequest request) {
        inventoryStockRequestValidator.validateImportRequest(request);

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found: " + request.getVariantId()));

        ProductBatch batch = productBatchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found: " + request.getBatchId()));

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found: " + request.getLocationId()));

        // Tính toán số lượng thực (theo đơn vị base unit)
        ProductVariant baseVariant = variant;
        int actualQuantity = request.getQuantity();

        if (!variant.isBaseUnit()) {
            // Đây là packaging variant, tìm base variant của product này
            baseVariant = productVariantRepository.findByProductIdAndIsBaseUnitTrue(variant.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Base unit variant not found for product: " + variant.getProduct().getId()));

            // Lấy hệ số quy đổi
            UnitConversion uc = unitConversionRepository
                    .findByVariantIdAndToUnitId(baseVariant.getId(), variant.getUnit().getId())
                    .orElseThrow(() -> new RuntimeException("Unit conversion not found"));

            int factor = uc.getConversionFactor().intValue();
            actualQuantity = request.getQuantity() * factor;
        }

        // Fix for lambda usage
        final ProductVariant finalBaseVariant = baseVariant;

        // Cập nhật tồn kho cho baseVariant thay vì packaging variant
        InventoryStock stock = inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(
                finalBaseVariant.getId(), request.getBatchId(), request.getLocationId())
                .orElseGet(() -> InventoryStock.builder()
                        .variant(finalBaseVariant)
                        .batch(batch)
                        .location(location)
                        .quantity(0)
                        .build());

        int oldQty = stock.getQuantity() != null ? stock.getQuantity() : 0;
        stock.setQuantity(oldQty + actualQuantity);
        InventoryStock savedStock = inventoryStockRepository.save(stock);
        outOfStockNotificationService.handleStockTransition(savedStock, oldQty, savedStock.getQuantity(), "IMPORT_STOCK");

        syncConvertedStocksFromBase(baseVariant, location, batch);

        // Ghi lại lịch sử
        recordMovement(baseVariant, batch, location, StockTransactionType.IMPORT, actualQuantity, "IMPORT", null,
                request.getNotes());
    }

    public void syncConvertedStocksFromBase(ProductVariant baseVariant, Location location, ProductBatch baseBatch) {
        if (baseVariant == null || baseVariant.getId() == null || !baseVariant.isBaseUnit() || location == null
                || location.getId() == null) {
            return;
        }

        List<UnitConversion> conversions = unitConversionRepository.findByVariantId(baseVariant.getId());
        if (conversions == null || conversions.isEmpty()) {
            return;
        }

        int baseStockAtLocation = inventoryStockRepository.findByVariantId(baseVariant.getId())
                .stream()
                .filter(stock -> stock.getLocation() != null
                && stock.getLocation().getId() != null
                && stock.getLocation().getId().equals(location.getId()))
                .mapToInt(stock -> stock.getQuantity() != null ? stock.getQuantity() : 0)
                .sum();

        for (UnitConversion conversion : conversions) {
            if (conversion == null
                    || conversion.getToUnit() == null
                    || conversion.getToUnit().getId() == null
                    || conversion.getConversionFactor() == null
                    || conversion.getConversionFactor().intValue() <= 0) {
                continue;
            }

            ProductVariant convertedVariant = findConvertedVariant(baseVariant, conversion.getToUnit().getId());
            if (convertedVariant == null || convertedVariant.getId() == null) {
                continue;
            }

            int convertedQty = baseStockAtLocation / conversion.getConversionFactor().intValue();
            ProductBatch convertedBatch = resolveConvertedBatch(convertedVariant, baseBatch);

            InventoryStock convertedStock = inventoryStockRepository
                    .findByVariantIdAndBatchIdAndLocationId(convertedVariant.getId(), convertedBatch.getId(), location.getId())
                    .orElseGet(() -> InventoryStock.builder()
                    .variant(convertedVariant)
                    .batch(convertedBatch)
                    .location(location)
                    .quantity(0)
                    .build());

            int oldQty = convertedStock.getQuantity() != null ? convertedStock.getQuantity() : 0;
            convertedStock.setQuantity(convertedQty);
            InventoryStock savedConvertedStock = inventoryStockRepository.save(convertedStock);
            outOfStockNotificationService.handleStockTransition(
                    savedConvertedStock,
                    oldQty,
                    savedConvertedStock.getQuantity(),
                    "CONVERSION_SYNC"
            );
        }
    }

    private ProductVariant findConvertedVariant(ProductVariant baseVariant, Integer toUnitId) {
        if (baseVariant == null || baseVariant.getProduct() == null || baseVariant.getProduct().getId() == null || toUnitId == null) {
            return null;
        }

        return productVariantRepository.findByProductIdAndUnitId(baseVariant.getProduct().getId(), toUnitId)
                .stream()
                .filter(candidate -> candidate != null
                && candidate.getId() != null
                && !candidate.getId().equals(baseVariant.getId())
                && hasSameAttributes(baseVariant, candidate))
                .findFirst()
                .orElse(null);
    }

    private ProductBatch resolveConvertedBatch(ProductVariant convertedVariant, ProductBatch baseBatch) {
        List<ProductBatch> existingBatches = productBatchRepository.findByVariantId(convertedVariant.getId());

        if (baseBatch != null && baseBatch.getBatchNumber() != null) {
            ProductBatch matchedBatch = existingBatches.stream()
                    .filter(batch -> batch != null && baseBatch.getBatchNumber().equals(batch.getBatchNumber()))
                    .findFirst()
                    .orElse(null);
            if (matchedBatch != null) {
                return matchedBatch;
            }
        }

        if (existingBatches != null && !existingBatches.isEmpty()) {
            return existingBatches.get(0);
        }

        return productBatchRepository.save(ProductBatch.builder()
                .variant(convertedVariant)
                .batchNumber(baseBatch != null ? baseBatch.getBatchNumber() : null)
                .mfgDate(baseBatch != null && baseBatch.getMfgDate() != null ? baseBatch.getMfgDate() : LocalDate.now())
                .expiryDate(baseBatch != null && baseBatch.getExpiryDate() != null ? baseBatch.getExpiryDate() : LocalDate.now().plusYears(1))
                .costPrice(baseBatch != null ? baseBatch.getCostPrice() : null)
                .build());
    }

    private boolean hasSameAttributes(ProductVariant left, ProductVariant right) {
        Map<String, String> leftAttrs = left != null && left.getAttributes() != null ? left.getAttributes() : Collections.emptyMap();
        Map<String, String> rightAttrs = right != null && right.getAttributes() != null ? right.getAttributes() : Collections.emptyMap();
        return leftAttrs.equals(rightAttrs);
    }

    /**
     * Trừ tồn kho (VD: Khi hoàn thành hóa đơn SaleOrder)
     * Tự động quy đổi qua base unit
     */
    @Transactional
    // Trừ stock.
    public void deductStock(ProductVariant variant, int quantity, Long orderId, String notes) {
        if (!variant.isBaseUnit()) {
            var directVariantStocks = inventoryStockRepository.findByVariantId(variant.getId());
            boolean hasDirectVariantStock = directVariantStocks.stream()
                    .anyMatch(stock -> stock.getQuantity() != null && stock.getQuantity() > 0);

            if (hasDirectVariantStock) {
                deductFromStocks(variant, quantity, directVariantStocks, orderId, notes);
                return;
            }
        }

        ProductVariant baseVariant = variant;
        int deductQuantity = quantity;

        if (!variant.isBaseUnit()) {
            baseVariant = productVariantRepository.findByProductIdAndIsBaseUnitTrue(variant.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Base unit variant not found for product: " + variant.getProduct().getId()));

            UnitConversion uc = unitConversionRepository
                    .findByVariantIdAndToUnitId(baseVariant.getId(), variant.getUnit().getId())
                    .orElseThrow(() -> new RuntimeException("Unit conversion not found"));

            int factor = uc.getConversionFactor().intValue();
            deductQuantity = quantity * factor;
        }

        var baseStocks = inventoryStockRepository.findByVariantId(baseVariant.getId());
        deductFromStocks(baseVariant, deductQuantity, baseStocks, orderId, notes);
    }

    private void deductFromStocks(ProductVariant stockVariant, int quantityToDeduct, java.util.List<InventoryStock> stocks,
            Long orderId, String notes) {
        int remainingToDeduct = quantityToDeduct;

        for (InventoryStock stock : stocks) {
            if (remainingToDeduct <= 0) {
                break;
            }

            int currentQty = stock.getQuantity() != null ? stock.getQuantity() : 0;
            if (currentQty <= 0) {
                continue;
            }

            int qtyToTake = Math.min(currentQty, remainingToDeduct);
            stock.setQuantity(currentQty - qtyToTake);
            InventoryStock savedStock = inventoryStockRepository.save(stock);
            outOfStockNotificationService.handleStockTransition(savedStock, currentQty, savedStock.getQuantity(), "SALE_ORDER");

            recordMovement(stockVariant, stock.getBatch(), stock.getLocation(),
                    StockTransactionType.SALE, -qtyToTake, "SALE_ORDER", orderId, notes);

            remainingToDeduct -= qtyToTake;
        }

        if (remainingToDeduct > 0) {
            throw new RuntimeException("Not enough stock available for variant: " + stockVariant.getSku());
        }
    }

    /**
     * Cộng tồn kho khi hoàn/trả hàng.
     * Tự động quy đổi về base unit giống deductStock.
     */
    @Transactional
    // Hoàn lại from refund.
    public void restockFromRefund(ProductVariant variant, int quantity, Long referenceId, String notes) {
        if (quantity <= 0) {
            throw new RuntimeException("Refund quantity must be greater than 0");
        }

        if (!variant.isBaseUnit()) {
            var directVariantStocks = inventoryStockRepository.findByVariantId(variant.getId());
            if (directVariantStocks != null && !directVariantStocks.isEmpty()) {
                InventoryStock stock = directVariantStocks.get(0);
                int oldQty = stock.getQuantity() != null ? stock.getQuantity() : 0;
                stock.setQuantity(oldQty + quantity);
                InventoryStock savedStock = inventoryStockRepository.save(stock);
                outOfStockNotificationService.handleStockTransition(savedStock, oldQty, savedStock.getQuantity(), "REFUND");

                recordMovement(variant, stock.getBatch(), stock.getLocation(),
                        StockTransactionType.ADJUSTMENT, quantity, "REFUND", referenceId, notes);
                return;
            }
        }

        ProductVariant baseVariant = variant;
        int restockQuantity = quantity;

        if (!variant.isBaseUnit()) {
            baseVariant = productVariantRepository.findByProductIdAndIsBaseUnitTrue(variant.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Base unit variant not found for product: " + variant.getProduct().getId()));

            UnitConversion uc = unitConversionRepository
                    .findByVariantIdAndToUnitId(baseVariant.getId(), variant.getUnit().getId())
                    .orElseThrow(() -> new RuntimeException("Unit conversion not found"));

            int factor = uc.getConversionFactor().intValue();
            restockQuantity = quantity * factor;
        }

        var stocks = inventoryStockRepository.findByVariantId(baseVariant.getId());
        if (stocks == null || stocks.isEmpty()) {
            throw new RuntimeException("No inventory stock record found for variant: " + baseVariant.getSku());
        }

        InventoryStock stock = stocks.get(0);
        int oldQty = stock.getQuantity() != null ? stock.getQuantity() : 0;
        stock.setQuantity(oldQty + restockQuantity);
        InventoryStock savedStock = inventoryStockRepository.save(stock);
        outOfStockNotificationService.handleStockTransition(savedStock, oldQty, savedStock.getQuantity(), "REFUND");

        recordMovement(baseVariant, stock.getBatch(), stock.getLocation(),
                StockTransactionType.ADJUSTMENT, restockQuantity, "REFUND", referenceId, notes);
    }

    /**
     * Điều chỉnh tồn kho thủ công
     */
    @Transactional
    // Điều chỉnh stock.
    public void adjustStock(StockAdjustRequest request) {
        inventoryStockRequestValidator.validateAdjustRequest(request);

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found: " + request.getVariantId()));

        if (!variant.isBaseUnit()) {
            throw new RuntimeException("Adjustment must be made on base unit variant");
        }

        InventoryStock stock = inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(
                request.getVariantId(), request.getBatchId(), request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Stock record not found"));

        int oldQty = stock.getQuantity() != null ? stock.getQuantity() : 0;
        stock.setQuantity(oldQty + request.getAdjustQuantity());
        InventoryStock savedStock = inventoryStockRepository.save(stock);
        outOfStockNotificationService.handleStockTransition(savedStock, oldQty, savedStock.getQuantity(), "MANUAL_ADJUSTMENT");

        recordMovement(variant, stock.getBatch(), stock.getLocation(), StockTransactionType.ADJUSTMENT,
                request.getAdjustQuantity(), "MANUAL_ADJUSTMENT", null, request.getReason());
    }

    private void recordMovement(ProductVariant variant, ProductBatch batch, Location location,
            StockTransactionType transactionType, int quantity,
            String referenceType, Long referenceId, String notes) {

        String movementType = (quantity >= 0) ? "IN" : "OUT";
        // Đối với ADJUSTMENT có thể IN/OUT tùy số âm/dương

        StockMovement movement = StockMovement.builder()
                .variant(variant)
                .batch(batch)
                .location(location)
                .type(movementType) // IN/OUT/ADJUST -> tương thích với entity cũ
                .quantity(quantity)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .notes(notes)
                .build();

        stockMovementRepository.save(movement);
    }
}
