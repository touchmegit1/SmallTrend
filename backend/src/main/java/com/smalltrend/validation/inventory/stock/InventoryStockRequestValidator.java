package com.smalltrend.validation.inventory.stock;

import com.smalltrend.dto.inventory.StockAdjustRequest;
import com.smalltrend.dto.inventory.StockImportRequest;
import org.springframework.stereotype.Component;

@Component
public class InventoryStockRequestValidator {

    public void validateImportRequest(StockImportRequest request) {
        if (request == null) {
            throw new RuntimeException("Request is required");
        }
        if (request.getVariantId() == null) {
            throw new RuntimeException("Variant is required");
        }
        if (request.getBatchId() == null) {
            throw new RuntimeException("Batch is required");
        }
        if (request.getLocationId() == null) {
            throw new RuntimeException("Location is required");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }
    }

    public void validateAdjustRequest(StockAdjustRequest request) {
        if (request == null) {
            throw new RuntimeException("Request is required");
        }
        if (request.getVariantId() == null) {
            throw new RuntimeException("Variant is required");
        }
        if (request.getBatchId() == null) {
            throw new RuntimeException("Batch is required");
        }
        if (request.getLocationId() == null) {
            throw new RuntimeException("Location is required");
        }
        if (request.getAdjustQuantity() == null) {
            throw new RuntimeException("Adjust quantity is required");
        }
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new RuntimeException("Reason is required");
        }
    }
}
