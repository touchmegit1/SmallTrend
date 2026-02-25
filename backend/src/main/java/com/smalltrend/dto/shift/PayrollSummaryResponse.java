package com.smalltrend.dto.shift;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollSummaryResponse {

    private String month;
    private Integer staffCount;
    private BigDecimal totalHours;
    private BigDecimal totalPayroll;
    private List<Row> rows;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Row {
        private Integer userId;
        private String fullName;
        private Integer totalShifts;
        private Integer workedShifts;
        private Integer lateShifts;
        private Integer absentShifts;
        private BigDecimal workedHours;
        private BigDecimal overtimeHours;
        private BigDecimal hourlyRate;
        private BigDecimal grossPay;
        private BigDecimal deductions;
        private BigDecimal netPay;
    }
}
