package com.smalltrend.service;

import com.smalltrend.dto.auditlog.AuditLogDTO;
import com.smalltrend.dto.auditlog.AuditLogFilterRequest;
import com.smalltrend.dto.auditlog.AuditLogPageResponse;
import com.smalltrend.entity.AuditLog;
import com.smalltrend.entity.User;
import com.smalltrend.repository.AuditLogRepository;
import com.smalltrend.repository.AuditLogSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ReportGeneratorService reportGeneratorService;

    /**
     * Save an audit log entry.
     *
     * @param actor      User who performed the action (nullable for anonymous actions)
     * @param action     Action name, e.g. LOGIN, CREATE_USER, UPDATE_USER, DELETE_USER
     * @param entityName Target entity type, e.g. "User"
     * @param entityId   PK of the affected entity (nullable)
     * @param result     "OK", "FAIL", or "DENIED"
     * @param ipAddress  Client IP address
     * @param changes    JSON/text describing changed fields (nullable)
     * @param details    Additional free-text details (nullable)
     */
    @Transactional
    public void logAction(User actor, String action, String entityName, Integer entityId,
                          String result, String ipAddress, String changes, String details) {
        try {
            AuditLog entry = AuditLog.builder()
                    .user(actor)
                    .action(action)
                    .entityName(entityName)
                    .entityId(entityId)
                    .result(result)
                    .ipAddress(ipAddress)
                    .changes(changes)
                    .details(details)
                    .source("WEB")
                    .createdAt(LocalDateTime.now())
                    .traceId(UUID.randomUUID().toString())
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to save audit log [action={}, result={}]: {}", action, result, e.getMessage());
        }
    }

    /**
     * Get filtered audit logs with pagination
     *
     * @param filter Filter criteria including date range, user, action, etc.
     * @return Paginated response with audit logs
     */
    @Transactional(readOnly = true)
    public AuditLogPageResponse getFilteredAuditLogs(AuditLogFilterRequest filter) {
        // Build specification from filter
        Specification<AuditLog> spec = AuditLogSpecification.filterBy(filter);

        // Create pageable with sorting
        Sort sort = Sort.by(
            filter.getSortDirection().equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC,
            filter.getSortBy()
        );

        Pageable pageable = PageRequest.of(
            filter.getPage(),
            filter.getSize(),
            sort
        );

        // Execute query
        Page<AuditLog> auditLogPage = auditLogRepository.findAll(spec, pageable);

        // Convert to DTOs
        List<AuditLogDTO> auditLogDTOs = auditLogPage.getContent()
            .stream()
            .map(AuditLogDTO::fromEntity)
            .collect(Collectors.toList());

        // Build response
        return AuditLogPageResponse.builder()
            .logs(auditLogDTOs)
            .totalElements(auditLogPage.getTotalElements())
            .totalPages(auditLogPage.getTotalPages())
            .currentPage(auditLogPage.getNumber())
            .pageSize(auditLogPage.getSize())
            .build();
    }

    /**
     * Get total count of audit logs matching the filter
     *
     * @param filter Filter criteria
     * @return Total count
     */
    @Transactional(readOnly = true)
    public long getAuditLogCount(AuditLogFilterRequest filter) {
        Specification<AuditLog> spec = AuditLogSpecification.filterBy(filter);
        return auditLogRepository.count(spec);
    }

    /**
     * Export ALL audit logs matching the filter as a styled PDF (no pagination limit).
     *
     * @param filter Filter criteria (page/size fields are ignored – all records are exported)
     * @return PDF bytes
     */
    @Transactional(readOnly = true)
    public byte[] exportAuditLogsPdf(AuditLogFilterRequest filter) {
        Specification<AuditLog> spec = AuditLogSpecification.filterBy(filter);

        Sort sort = Sort.by(
            filter.getSortDirection() != null && filter.getSortDirection().equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC : Sort.Direction.DESC,
            filter.getSortBy() != null ? filter.getSortBy() : "createdAt"
        );

        // Fetch all matching records (max 10,000 to protect server)
        Pageable all = PageRequest.of(0, 10_000, sort);
        List<AuditLog> logs = auditLogRepository.findAll(spec, all).getContent();

        // Build subtitle from filter dates
        String tz = filter.getTimezone() != null ? filter.getTimezone() : "Asia/Bangkok";
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm").withZone(ZoneId.of(tz));
        String subtitle;
        if (filter.getFromDateTime() != null && filter.getToDateTime() != null) {
            subtitle = fmt.format(filter.getFromDateTime()) + "  →  " + fmt.format(filter.getToDateTime()) + "  " + tz;
        } else {
            subtitle = "All records  •  " + tz;
        }

        // KPI summary cards
        long total  = logs.size();
        long okCnt  = logs.stream().filter(l -> "OK".equalsIgnoreCase(l.getResult())).count();
        long failCnt= logs.stream().filter(l -> "FAIL".equalsIgnoreCase(l.getResult())).count();
        long deniedCnt = logs.stream().filter(l -> "DENIED".equalsIgnoreCase(l.getResult())).count();

        Map<String, String> kpis = new LinkedHashMap<>();
        kpis.put("Total Events", String.valueOf(total));
        kpis.put("Successful (OK)", String.valueOf(okCnt));
        kpis.put("Failed", String.valueOf(failCnt));
        kpis.put("Denied", String.valueOf(deniedCnt));

        // Column headers
        List<String> headers = List.of("Time", "Actor", "Action", "Target", "Result", "IP Address", "Source", "Trace ID");

        // Rows
        DateTimeFormatter rowFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        List<List<String>> rows = new ArrayList<>();
        for (AuditLog log : logs) {
            String time = log.getCreatedAt() != null ? log.getCreatedAt().format(rowFmt) : "—";
            String actor = log.getUser() != null
                ? (log.getUser().getFullName() != null ? log.getUser().getFullName() : "")
                  + (log.getUser().getEmail() != null ? " (" + log.getUser().getEmail() + ")" : "")
                : "System";
            String target = (log.getEntityName() != null ? log.getEntityName() : "")
                + (log.getEntityId() != null ? "#" + log.getEntityId() : "");

            rows.add(List.of(
                time,
                actor,
                log.getAction() != null ? log.getAction() : "—",
                !target.isEmpty() ? target : "—",
                log.getResult() != null ? log.getResult() : "—",
                log.getIpAddress() != null ? log.getIpAddress() : "—",
                log.getSource() != null ? log.getSource() : "—",
                log.getTraceId() != null ? log.getTraceId().substring(0, Math.min(16, log.getTraceId().length())) : "—"
            ));
        }

        return reportGeneratorService.generatePdf("Audit Log Report", subtitle, headers, rows, kpis, -1);
    }
}
