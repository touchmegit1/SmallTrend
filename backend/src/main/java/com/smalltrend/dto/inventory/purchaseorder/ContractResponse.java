package com.smalltrend.dto.inventory.purchaseorder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {
    private Long id;
    private String contractNumber;
    private String title;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalValue;
}
