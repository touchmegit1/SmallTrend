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
        // Accept all valid reason types from DisposalReason enum
        if (request.getReasonType() != null && !request.getReasonType().trim().isEmpty()) {
            try {
                com.smalltrend.entity.enums.DisposalReason.valueOf(request.getReasonType().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid reason type: " + request.getReasonType()
                    + ". Valid values: EXPIRED, DAMAGED, LOST, OBSOLETE, OTHER");
            }
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("At least one disposal item is required");
        }
    }
}
