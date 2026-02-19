package com.smalltrend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportPageResponse {
    private List<ReportDTO> reports;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}
