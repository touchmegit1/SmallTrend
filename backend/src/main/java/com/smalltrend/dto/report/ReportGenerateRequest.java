package com.smalltrend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportGenerateRequest {
    private String type; // Revenue, Products, Customers, Inventory
    private LocalDate fromDate;
    private LocalDate toDate;
    private String format; // PDF, EXCEL, CSV
}
