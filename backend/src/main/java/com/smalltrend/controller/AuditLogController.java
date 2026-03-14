package com.smalltrend.controller;

import com.smalltrend.dto.auditlog.AuditLogFilterRequest;
import com.smalltrend.dto.auditlog.AuditLogPageResponse;
import com.smalltrend.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Get filtered audit logs with pagination
     * This endpoint is restricted to ADMIN users only (SecurityAdmin role)
     *
     * @param fromDateTime Start date/time for filtering
     * @param toDateTime End date/time for filtering
     * @param timezone Timezone (e.g., "Asia/Bangkok")
     * @param result Result filter (ALL, OK, FAIL, DENIED)
     * @param userSearch User search (email, username, or userId)
     * @param action Action filter (ALL, UPDATE_PROFILE, LOGIN, GRANT_ROLE, DELETE)
     * @param target Target/Resource filter
     * @param ipAddress IP address filter
     * @param traceId Trace/Correlation ID filter
     * @param source Source filter
     * @param page Page number (default: 0)
     * @param size Page size (default: 50)
     * @param sortBy Sort field (default: createdAt)
     * @param sortDirection Sort direction (default: DESC)
     * @return Paginated audit log response
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditLogPageResponse> getAuditLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDateTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDateTime,
            @RequestParam(required = false, defaultValue = "Asia/Bangkok") String timezone,
            @RequestParam(required = false, defaultValue = "ALL") String result,
            @RequestParam(required = false) String userSearch,
            @RequestParam(required = false, defaultValue = "ALL") String action,
            @RequestParam(required = false) String target,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) String traceId,
            @RequestParam(required = false) String source,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "50") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                .fromDateTime(fromDateTime)
                .toDateTime(toDateTime)
                .timezone(timezone)
                .result(result)
                .userSearch(userSearch)
                .action(action)
                .target(target)
                .ipAddress(ipAddress)
                .traceId(traceId)
                .source(source)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        AuditLogPageResponse response = auditLogService.getFilteredAuditLogs(filter);
        return ResponseEntity.ok(response);
    }

    /**
     * Get total count of audit logs matching the filter
     *
     * @param fromDateTime Start date/time for filtering
     * @param toDateTime End date/time for filtering
     * @param result Result filter
     * @param userSearch User search
     * @param action Action filter
     * @param target Target/Resource filter
     * @param ipAddress IP address filter
     * @param traceId Trace ID filter
     * @param source Source filter
     * @return Total count
     */
    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getAuditLogCount(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDateTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDateTime,
            @RequestParam(required = false, defaultValue = "ALL") String result,
            @RequestParam(required = false) String userSearch,
            @RequestParam(required = false, defaultValue = "ALL") String action,
            @RequestParam(required = false) String target,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) String traceId,
            @RequestParam(required = false) String source
    ) {
        AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                .fromDateTime(fromDateTime)
                .toDateTime(toDateTime)
                .result(result)
                .userSearch(userSearch)
                .action(action)
                .target(target)
                .ipAddress(ipAddress)
                .traceId(traceId)
                .source(source)
                .build();

        long count = auditLogService.getAuditLogCount(filter);
        return ResponseEntity.ok(count);
    }
}
