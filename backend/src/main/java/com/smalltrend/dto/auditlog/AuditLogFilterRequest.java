package com.smalltrend.dto.auditlog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogFilterRequest {
    private LocalDateTime fromDateTime;
    private LocalDateTime toDateTime;
    private String timezone; // e.g., "Asia/Bangkok"
    private String result; // ALL, OK, FAIL, DENIED
    private String userSearch; // email, username, or userId
    private String action; // ALL, UPDATE_PROFILE, LOGIN, GRANT_ROLE, DELETE
    private String target; // Target/Resource
    private String ipAddress;
    private String traceId;
    private String source;

    // Pagination
    @Builder.Default
    private Integer page = 0;
    @Builder.Default
    private Integer size = 50;
    @Builder.Default
    private String sortBy = "createdAt";
    @Builder.Default
    private String sortDirection = "DESC";
}
