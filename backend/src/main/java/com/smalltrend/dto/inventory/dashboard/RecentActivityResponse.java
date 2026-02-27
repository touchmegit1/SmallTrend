package com.smalltrend.dto.inventory.dashboard;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityResponse {
    private String type; // IN, OUT, ADJUST
    private String productName;
    private Integer quantity;
    private String referenceType;
    private String referenceCode;
    private LocalDateTime createdAt;
}
