package com.smalltrend.service;

import com.smalltrend.dto.pos.BarcodeLookupResponse;
import com.smalltrend.dto.pos.ProductVariantRespone;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.UnitConversion;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.service.inventory.InventoryStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BarcodeLookupService {

    private final ProductVariantRepository productVariantRepository;
    private final UnitConversionRepository unitConversionRepository;
    private final InventoryStockService inventoryStockService;

    public BarcodeLookupResponse lookupBarcode(String barcode) {
        ProductVariant scannedVariant = productVariantRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Barcode not found: " + barcode));

        ProductVariant baseVariant = scannedVariant;
        BigDecimal conversionFactor = BigDecimal.ONE;
        BigDecimal sellPrice = scannedVariant.getSellPrice();
        String unitName = scannedVariant.getUnit().getName();

        if (!scannedVariant.isBaseUnit()) {
            // Find base variant
            baseVariant = productVariantRepository.findByProductIdAndIsBaseUnitTrue(scannedVariant.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Base unit variant not configured for product: " + scannedVariant.getProduct().getId()));

            // Find conversion factor
            UnitConversion uc = unitConversionRepository
                    .findByVariantIdAndToUnitId(baseVariant.getId(), scannedVariant.getUnit().getId())
                    .orElseThrow(() -> new RuntimeException("Unit conversion missing for " + scannedVariant.getSku()));

            conversionFactor = uc.getConversionFactor();
            sellPrice = uc.getSellPrice() != null ? uc.getSellPrice() : scannedVariant.getSellPrice();
        }

        // Kiểm tra tồn kho theo base unit
        int stockAvailable = inventoryStockService.getTotalStockForVariant(baseVariant.getId());

        // Map to Response DTO
        ProductVariantRespone pvResponse = new ProductVariantRespone();
        pvResponse.setId(baseVariant.getId());
        pvResponse.setName(baseVariant.getProduct().getName());
        pvResponse.setSku(baseVariant.getSku());
        pvResponse.setBarcode(baseVariant.getBarcode());
        pvResponse.setSellPrice(baseVariant.getSellPrice());
        pvResponse.setCategoryName(
                baseVariant.getProduct().getCategory() != null ? baseVariant.getProduct().getCategory().getName() : "");
        pvResponse.setBrandName(
                baseVariant.getProduct().getBrand() != null ? baseVariant.getProduct().getBrand().getName() : "");
        pvResponse.setUnitId(baseVariant.getUnit().getId());
        pvResponse.setUnitName(baseVariant.getUnit().getName());
        pvResponse.setImageUrl(
                baseVariant.getImageUrl() != null ? baseVariant.getImageUrl() : baseVariant.getProduct().getImageUrl());
        pvResponse.setIsActive(baseVariant.isActive());

        return BarcodeLookupResponse.builder()
                .variant(pvResponse)
                .scannedVariantId(scannedVariant.getId())
                .unitName(unitName)
                .unitPrice(sellPrice)
                .conversionFactor(conversionFactor)
                .isBaseUnit(scannedVariant.isBaseUnit())
                .stockAvailable(stockAvailable)
                .build();
    }
}
