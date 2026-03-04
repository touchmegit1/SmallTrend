package com.smalltrend.controller;

import com.smalltrend.dto.report.*;
import com.smalltrend.service.CloudinaryService;
import com.smalltrend.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ReportController {

    private final ReportService reportService;
    private final CloudinaryService cloudinaryService;

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
     * Stream the report file through the backend.
     * Downloads from Cloudinary using API credentials and serves bytes directly to the browser.
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable Integer id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        ReportDTO report = reportService.getReportById(id, userEmail);

        String rawUrl = report.getDownloadUrl() != null ? report.getDownloadUrl() : report.getFilePath();
        if (!"COMPLETED".equals(report.getStatus()) || rawUrl == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            byte[] fileBytes = cloudinaryService.downloadFileBytes(rawUrl);

            String filename = rawUrl.substring(rawUrl.lastIndexOf('/') + 1);
            MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
            if (filename.endsWith(".pdf")) contentType = MediaType.APPLICATION_PDF;
            else if (filename.endsWith(".xlsx")) contentType = MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            else if (filename.endsWith(".csv")) contentType = MediaType.parseMediaType("text/csv");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(contentType)
                    .body(fileBytes);

        } catch (Exception e) {
            log.error("Failed to stream report {} for user {}", id, userEmail, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
