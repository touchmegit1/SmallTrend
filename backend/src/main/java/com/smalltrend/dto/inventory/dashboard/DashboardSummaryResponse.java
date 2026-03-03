package com.smalltrend.dto.inventory.dashboard;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private Integer totalProducts;
    private BigDecimal totalInventoryValue;
    private Integer lowStockCount;
    private Integer expiredBatchCount;
    private Integer expiringSoonCount;
    private Integer needActionCount;
}
