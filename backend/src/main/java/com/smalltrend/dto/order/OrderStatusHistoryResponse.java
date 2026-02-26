package com.smalltrend.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusHistoryResponse {

    private Long id;
    private String fromStatus;
    private String toStatus;
    private String actionType;
    private Integer changedByUserId;
    private String changedByName;
    private String changeNotes;
    private LocalDateTime changedAt;
}
