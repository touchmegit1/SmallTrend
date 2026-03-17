package com.smalltrend.service.inventory;

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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public void importStock(StockImportRequest request) {
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

        // Ghi lại lịch sử
        recordMovement(baseVariant, batch, location, StockTransactionType.IMPORT, actualQuantity, "IMPORT", null,
                request.getNotes());
    }

    /**
     * Trừ tồn kho (VD: Khi hoàn thành hóa đơn SaleOrder)
     * Tự động quy đổi qua base unit
     */
    @Transactional
    public void deductStock(ProductVariant variant, int quantity, Long orderId, String notes) {
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

        // Ưu tiên trừ theo lô cũ (FIFO đơn giản)
        int remainingToDeduct = deductQuantity;
        var stocks = inventoryStockRepository.findByVariantId(baseVariant.getId());

        for (InventoryStock stock : stocks) {
            if (remainingToDeduct <= 0)
                break;

            if (stock.getQuantity() > 0) {
                int oldQty = stock.getQuantity();
                int qtyToTake = Math.min(oldQty, remainingToDeduct);
                stock.setQuantity(oldQty - qtyToTake);
                InventoryStock savedStock = inventoryStockRepository.save(stock);
                outOfStockNotificationService.handleStockTransition(savedStock, oldQty, savedStock.getQuantity(), "SALE_ORDER");

                // Ghi nhận biến động cho lô này
                recordMovement(baseVariant, stock.getBatch(), stock.getLocation(),
                        StockTransactionType.SALE, -qtyToTake, "SALE_ORDER", orderId, notes);

                remainingToDeduct -= qtyToTake;
            }
        }

        if (remainingToDeduct > 0) {
            // Vẫn chưa trừ hết (Tồn kho bị âm - Tùy cấu hình hệ thống POS có thể bắn lỗi)
            // Trong bối cảnh bán lẻ, thường ta ghi log cảnh báo và cho phép bán âm, hoặc
            // trừ âm vào một location mặc định.
            // Để an toàn, chúng ta throw exception ở đây trừ khi requirements cho phép âm.
            throw new RuntimeException("Not enough stock available for variant: " + baseVariant.getSku());
        }
    }

    /**
     * Điều chỉnh tồn kho thủ công
     */
    @Transactional
    public void adjustStock(StockAdjustRequest request) {
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
