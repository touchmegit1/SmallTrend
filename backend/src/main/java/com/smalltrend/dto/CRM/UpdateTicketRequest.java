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
}
