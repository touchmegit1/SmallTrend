package com.smalltrend.dto.report;

import com.smalltrend.entity.Report;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDTO {
    private Integer id;
    private String reportName;
    private String type;
    private LocalDate reportDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String format;
    private String filePath;
    private Integer createdBy;
    private String createdByName;
    private String createdByEmail;

    public static ReportDTO fromEntity(Report report) {
        return ReportDTO.builder()
                .id(report.getId())
                .reportName(report.getReportName())
                .type(report.getType())
                .reportDate(report.getReportDate())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .completedAt(report.getCompletedAt())
                .format(report.getFormat())
                .filePath(report.getFilePath())
                .createdBy(report.getCreatedBy() != null ? report.getCreatedBy().getId() : null)
                .createdByName(report.getCreatedBy() != null ? report.getCreatedBy().getFullName() : null)
                .createdByEmail(report.getCreatedBy() != null ? report.getCreatedBy().getEmail() : null)
                .build();
    }
}
