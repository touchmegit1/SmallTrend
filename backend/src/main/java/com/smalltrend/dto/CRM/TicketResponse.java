package com.smalltrend.dto.CRM;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String ticketCode;
    private String ticketType;
    private String title;
    private String description;
    private String status;
    private String priority;

    private Integer createdByUserId;
    private String createdByName;

    private Integer assignedToUserId;
    private String assignedToName;

    private Integer resolvedByUserId;
    private String resolvedByName;

    private String relatedEntityType;
    private Long relatedEntityId;

    private String resolution;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
