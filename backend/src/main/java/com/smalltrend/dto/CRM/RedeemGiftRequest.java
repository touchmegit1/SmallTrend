package com.smalltrend.dto.CRM;

import lombok.Data;

@Data
public class RedeemGiftRequest {
    private Integer customerId;
    private Integer giftId;
}
