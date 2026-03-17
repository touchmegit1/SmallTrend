package com.smalltrend.validation.inventory.count;

import com.smalltrend.dto.inventory.inventorycount.InventoryCountItemRequest;
import com.smalltrend.dto.inventory.inventorycount.InventoryCountRequest;
import com.smalltrend.exception.InventoryCountException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InventoryCountRequestValidator {

    public void validateRequiredForWorkflow(InventoryCountRequest request) {
        if (request == null) {
            throw new RuntimeException("Request is required");
        }
        validateItemsRequired(request.getItems());
        validateLocationRequired(request.getLocationId());
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
