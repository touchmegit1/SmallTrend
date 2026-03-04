package com.smalltrend.controller;

import com.smalltrend.dto.report.*;
import com.smalltrend.service.CloudinaryService;
import com.smalltrend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

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
     * Download report — redirects browser to the Cloudinary secure URL.
     * The file is served directly from Cloudinary, not streamed through this server.
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> downloadReport(
            @PathVariable Integer id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        ReportDTO report = reportService.getReportById(id, userEmail);

        // prefer the dedicated downloadUrl column, fall back to filePath for old records
        String rawUrl = report.getDownloadUrl() != null ? report.getDownloadUrl() : report.getFilePath();
        if (!"COMPLETED".equals(report.getStatus()) || rawUrl == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Generate a signed URL — bypasses Cloudinary access restrictions
        String signedUrl = cloudinaryService.generateSignedDownloadUrl(rawUrl);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(signedUrl))
                .build();
    }

    /**
     * Returns the Cloudinary download URL as JSON so the frontend can open it directly.
     */
    @GetMapping("/{id}/download-url")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getDownloadUrl(
            @PathVariable Integer id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        ReportDTO report = reportService.getReportById(id, userEmail);

        // prefer the dedicated downloadUrl column, fall back to filePath for old records
        String rawUrl = report.getDownloadUrl() != null ? report.getDownloadUrl() : report.getFilePath();
        if (!"COMPLETED".equals(report.getStatus()) || rawUrl == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Generate a signed URL — bypasses Cloudinary access restrictions
        String signedUrl = cloudinaryService.generateSignedDownloadUrl(rawUrl);
        return ResponseEntity.ok(Map.of("url", signedUrl));
    }
}
