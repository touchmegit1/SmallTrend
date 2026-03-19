package com.smalltrend.dto.CRM;

import lombok.Data;

@Data
public class UpdateTicketRequest {
    private String title;
    private String description;
    private String priority;
    private String status;
    private Integer assignedToUserId;
    private String resolution;

    // Refund-specific fields (used when resolving refund tickets)
    private String sku;
    private Integer refundQuantity;
}
