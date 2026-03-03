package com.smalltrend.dto.inventory.dashboard;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchStatusResponse {
    private Integer batchId;
    private String batchCode;
    private String productName;
    private Integer quantity;
    private LocalDate expiryDate;
    private String status; // EXPIRED, EXPIRING_SOON, SAFE
    private Integer daysUntilExpiry;
    private BigDecimal value;
    private LocalDate receivedDate;
}
