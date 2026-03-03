package com.smalltrend.dto.inventory.disposal;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisposalVoucherRequest {
    private Long locationId;
    private String reasonType;
    private String notes;
    private List<DisposalVoucherItemRequest> items;
}
