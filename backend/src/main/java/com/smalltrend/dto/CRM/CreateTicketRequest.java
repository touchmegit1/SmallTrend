package com.smalltrend.dto.CRM;

import lombok.Data;

@Data
public class CreateTicketRequest {
    private String ticketType;
    private String title;
    private String description;
    private String priority;
    private String relatedEntityType;
    private Long relatedEntityId;
    private Integer assignedToUserId;

    // Refund-specific fields
    private String sku;
    private Integer refundQuantity;
}
