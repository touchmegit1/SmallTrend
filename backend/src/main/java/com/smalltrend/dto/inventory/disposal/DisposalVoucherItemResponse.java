package com.smalltrend.dto.inventory.disposal;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisposalVoucherItemResponse {
    private Long id;
    private Long batchId;
    private Long productId;
    private String productName;
    private String batchCode;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private LocalDate expiryDate;
}
