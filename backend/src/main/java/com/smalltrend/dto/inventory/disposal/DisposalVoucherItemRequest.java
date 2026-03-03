package com.smalltrend.dto.inventory.disposal;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisposalVoucherItemRequest {
    private Long batchId;
    private Long productId;
    private Integer quantity;
}
