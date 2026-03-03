package com.smalltrend.dto.inventory.disposal;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisposalVoucherResponse {
    private Long id;
    private String code;
    private Long locationId;
    private String locationName;
    private String status;
    private String reasonType;
    private String notes;
    private Integer totalItems;
    private Integer totalQuantity;
    private BigDecimal totalValue;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private Long confirmedBy;
    private String confirmedByName;
    private LocalDateTime confirmedAt;
    private List<DisposalVoucherItemResponse> items;
}
