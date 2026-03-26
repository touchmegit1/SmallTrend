package com.smalltrend.validation.inventory.count;

import com.smalltrend.dto.inventory.count.InventoryCountItemRequest;
import com.smalltrend.dto.inventory.count.InventoryCountRequest;
import com.smalltrend.exception.InventoryCountException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class InventoryCountRequestValidator {

    public void validateRequiredForWorkflow(InventoryCountRequest request) {
        if (request == null) {
            throw new RuntimeException("Request is required");
        }
        validateItemsRequired(request.getItems());
        validateLocationRequired(request.getLocationId());
        validateDifferenceSigns(request.getItems());
    }

    public void validateDifferenceSigns(List<InventoryCountItemRequest> items) {
        if (items == null || items.isEmpty()) {
            return;
        }

        for (InventoryCountItemRequest item : items) {
            Integer differenceQuantity = item.getDifferenceQuantity();
            BigDecimal differenceValue = item.getDifferenceValue();

            if (differenceQuantity == null || differenceValue == null) {
                continue;
            }

            if (differenceQuantity < 0 && differenceValue.compareTo(BigDecimal.ZERO) > 0) {
                throw InventoryCountException.invalidDifferenceSign(differenceQuantity, differenceValue);
            }

            if (differenceQuantity > 0 && differenceValue.compareTo(BigDecimal.ZERO) < 0) {
                throw InventoryCountException.invalidDifferenceSign(differenceQuantity, differenceValue);
            }
        }
    }

    public void validateItemsRequired(List<InventoryCountItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw InventoryCountException.countItemsRequired();
        }
    }

    public void validateLocationRequired(Integer locationId) {
        if (locationId == null) {
            throw InventoryCountException.locationRequired();
        }
    }
}
