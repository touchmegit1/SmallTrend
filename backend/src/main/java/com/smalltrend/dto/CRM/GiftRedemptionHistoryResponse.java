package com.smalltrend.dto.CRM;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GiftRedemptionHistoryResponse {
    private Integer id;
    private Integer customerId;
    private String customerName;
    private Integer giftId;
    private String giftName;
    private Integer pointsUsed;
    private LocalDateTime redeemedAt;
}
