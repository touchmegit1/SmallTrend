package com.smalltrend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuickReportSummary {
    private String title;
    private String type;
    private String badge; // Ready, Pending
    private String description;
    private boolean available;
}
