package com.smalltrend.dto.auditlog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogPageResponse {
    private List<AuditLogDTO> logs;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}
