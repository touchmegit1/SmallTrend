package com.smalltrend.controller;

import com.smalltrend.dto.report.*;
import com.smalltrend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ReportController {

    private final ReportService reportService;

    /**
     * Get quick report summaries
     */
    @GetMapping("/quick")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<QuickReportSummary>> getQuickReports() {
        List<QuickReportSummary> summaries = reportService.getQuickReports();
        return ResponseEntity.ok(summaries);
    }

    /**
     * Generate a new report (async)
     * Returns 202 Accepted with the report ID
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportDTO> generateReport(
            @RequestBody ReportGenerateRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        ReportDTO report = reportService.generateReport(request, userEmail);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(report);
    }

    /**
     * Get report history for current user
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportPageResponse> getReportHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String userEmail = authentication.getName();
        ReportPageResponse response = reportService.getReportHistory(userEmail, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all reports (Admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportPageResponse> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ReportPageResponse response = reportService.getAllReports(page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Get report by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportDTO> getReportById(
            @PathVariable Integer id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        ReportDTO report = reportService.getReportById(id, userEmail);
        return ResponseEntity.ok(report);
    }

    /**
     * Delete report
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReport(
            @PathVariable Integer id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        reportService.deleteReport(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    /**
     * Download report file
     * This is a placeholder - implement actual file download logic
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable Integer id,
            Authentication authentication) {
        // TODO: Implement actual file download
        // For now, return a placeholder response
        String userEmail = authentication.getName();
        ReportDTO report = reportService.getReportById(id, userEmail);

        if (!"COMPLETED".equals(report.getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Read the file from the file system
        try {
            String filePath = report.getFilePath();
            if (filePath != null && filePath.startsWith("/")) {
                filePath = filePath.substring(1); // Remove leading slash to make it relative
            }

            java.nio.file.Path path = java.nio.file.Paths.get(filePath);
            byte[] data = java.nio.file.Files.readAllBytes(path);

            String contentType = "application/octet-stream";
            if (report.getFormat().equalsIgnoreCase("PDF")) {
                contentType = "application/pdf";
            } else if (report.getFormat().equalsIgnoreCase("EXCEL")) {
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else if (report.getFormat().equalsIgnoreCase("CSV")) {
                contentType = "text/csv";
            }

            String extension = "pdf";
            if (report.getFormat().equalsIgnoreCase("EXCEL")) {
                extension = "xlsx";
            } else if (report.getFormat().equalsIgnoreCase("CSV")) {
                extension = "csv";
            }

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Content-Disposition", "attachment; filename=\"" + report.getReportName() + "." + extension + "\"")
                    .body(data);
        } catch (java.io.IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
