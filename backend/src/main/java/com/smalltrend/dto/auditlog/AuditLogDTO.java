package com.smalltrend.dto.auditlog;

import com.smalltrend.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDTO {
    private Integer id;
    private Integer userId;
    private String userEmail;
    private String userName;
    private String action;
    private String target; // entityName#entityId format
    private String result;
    private String ipAddress;
    private String traceId;
    private LocalDateTime createdAt;
    private String changes;
    private String details;
    private String source;

    public static AuditLogDTO fromEntity(AuditLog auditLog) {
        String target = null;
        if (auditLog.getEntityName() != null && auditLog.getEntityId() != null) {
            target = auditLog.getEntityName() + "#" + auditLog.getEntityId();
        }

        return AuditLogDTO.builder()
                .id(auditLog.getId())
                .userId(auditLog.getUser() != null ? auditLog.getUser().getId() : null)
                .userEmail(auditLog.getUser() != null ? auditLog.getUser().getEmail() : null)
                .userName(auditLog.getUser() != null ? auditLog.getUser().getFullName() : null)
                .action(auditLog.getAction())
                .target(target)
                .result(auditLog.getResult())
                .ipAddress(auditLog.getIpAddress())
                .traceId(auditLog.getTraceId())
                .createdAt(auditLog.getCreatedAt())
                .changes(auditLog.getChanges())
                .details(auditLog.getDetails())
                .source(auditLog.getSource())
                .build();
    }
}
