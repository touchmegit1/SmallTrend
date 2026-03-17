package com.smalltrend.validation.inventory.disposal;

import com.smalltrend.dto.inventory.disposal.DisposalVoucherRequest;
import org.springframework.stereotype.Component;

@Component
public class DisposalVoucherRequestValidator {

    public void validateDraftRequest(DisposalVoucherRequest request) {
        if (request == null) {
            throw new RuntimeException("Request is required");
        }
        if (request.getLocationId() == null) {
            throw new RuntimeException("Location is required");
        }
        if (request.getReasonType() != null && !request.getReasonType().trim().isEmpty()
                && !"EXPIRED".equalsIgnoreCase(request.getReasonType().trim())) {
            throw new RuntimeException("Only EXPIRED reason type is allowed");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("At least one disposal item is required");
        }
    }
}
