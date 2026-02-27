package com.smalltrend.service;

import com.smalltrend.dto.report.*;
import com.smalltrend.entity.Report;
import com.smalltrend.entity.User;
import com.smalltrend.entity.UserCredential;
import com.smalltrend.repository.ReportRepository;
import com.smalltrend.repository.UserCredentialsRepository;
import com.smalltrend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;


import java.time.LocalDate;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final UserCredentialsRepository userCredentialsRepository;
    private final ReportProcessingService reportProcessingService;

    /**
     * Get quick report summaries
     */
    public List<QuickReportSummary> getQuickReports() {
        List<QuickReportSummary> summaries = new ArrayList<>();

        summaries.add(QuickReportSummary.builder()
                .title("Daily Revenue")
                .type("Revenue")
                .badge("Ready")
                .description("Doanh thu theo ngày")
                .available(true)
                .build());

        summaries.add(QuickReportSummary.builder()
                .title("Top Products")
                .type("Products")
                .badge("Ready")
                .description("Top sản phẩm")
                .available(true)
                .build());

        summaries.add(QuickReportSummary.builder()
                .title("Customer Analysis")
                .type("Customers")
                .badge("Ready")
                .description("Phân tích khách hàng")
                .available(true)
                .build());

        summaries.add(QuickReportSummary.builder()
                .title("Inventory Report")
                .type("Inventory")
                .badge("Pending")
                .description("Báo cáo tồn kho")
                .available(false)
                .build());

        return summaries;
    }

    /**
     * Generate a new report (async)
     */
    @Transactional
    public ReportDTO generateReport(ReportGenerateRequest request, String username) {
        UserCredential credential = userCredentialsRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user = credential.getUser();

        // Generate report name
        String reportName = generateReportName(request.getType(), request.getFromDate(), request.getToDate());

        // Create report entity with PENDING status
        Report report = Report.builder()
                .reportName(reportName)
                .type(request.getType())
                .reportDate(LocalDate.now())
                .status("PENDING")
                .format(request.getFormat() != null ? request.getFormat() : "PDF")
                .createdBy(user)
                .build();

        report = reportRepository.save(report);

        // Trigger async processing AFTER transaction commits
        // This ensures the report is fully persisted before the async thread tries to read it
        final Integer reportId = report.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                reportProcessingService.processReportAsync(reportId, request);
            }
        });

        return ReportDTO.fromEntity(report);
    }

    /**
     * Get report history with pagination
     */
    @Transactional(readOnly = true)
    public ReportPageResponse getReportHistory(String username, int page, int size) {
        UserCredential credential = userCredentialsRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user = credential.getUser();

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Report> reportPage = reportRepository.findByCreatedBy(user, pageable);

        List<ReportDTO> reportDTOs = reportPage.getContent()
                .stream()
                .map(ReportDTO::fromEntity)
                .collect(Collectors.toList());

        return ReportPageResponse.builder()
                .reports(reportDTOs)
                .totalElements(reportPage.getTotalElements())
                .totalPages(reportPage.getTotalPages())
                .currentPage(reportPage.getNumber())
                .pageSize(reportPage.getSize())
                .build();
    }

    /**
     * Get all reports (Admin only)
     */
    @Transactional(readOnly = true)
    public ReportPageResponse getAllReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Report> reportPage = reportRepository.findAll(pageable);

        List<ReportDTO> reportDTOs = reportPage.getContent()
                .stream()
                .map(ReportDTO::fromEntity)
                .collect(Collectors.toList());

        return ReportPageResponse.builder()
                .reports(reportDTOs)
                .totalElements(reportPage.getTotalElements())
                .totalPages(reportPage.getTotalPages())
                .currentPage(reportPage.getNumber())
                .pageSize(reportPage.getSize())
                .build();
    }

    /**
     * Get report by ID
     */
    @Transactional(readOnly = true)
    public ReportDTO getReportById(Integer id, String username) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        // Check if user has access to this report
        UserCredential credential = userCredentialsRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!report.getCreatedBy().getId().equals(credential.getUser().getId())) {
            throw new RuntimeException("Access denied");
        }

        return ReportDTO.fromEntity(report);
    }

    /**
     * Delete report
     */
    @Transactional
    public void deleteReport(Integer id, String username) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        // Check if user has access to this report
        UserCredential credential = userCredentialsRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!report.getCreatedBy().getId().equals(credential.getUser().getId())) {
            throw new RuntimeException("Access denied");
        }

        reportRepository.delete(report);
    }

    /**
     * Generate report name
     */
    private String generateReportName(String type, LocalDate fromDate, LocalDate toDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String dateRange = "";

        if (fromDate != null && toDate != null) {
            dateRange = " (" + fromDate.format(formatter) + " - " + toDate.format(formatter) + ")";
        }

        return type + " Report" + dateRange;
    }
}
