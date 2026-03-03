package com.smalltrend.dto.payroll;

import com.smalltrend.entity.enums.PayrollStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PayrollRecordDTO {

    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    private BigDecimal baseSalary;
    private BigDecimal regularHours;
    private BigDecimal overtimeHours;
    private BigDecimal hourlyRate;
    private BigDecimal overtimeRate;
    private BigDecimal regularPay;
    private BigDecimal overtimePay;
    private BigDecimal allowances;
    private BigDecimal bonus;
    private BigDecimal deductions;
    private BigDecimal taxAmount;
    private BigDecimal socialInsurance;
    private BigDecimal grossPay;
    private BigDecimal netPay;
    private PayrollStatus status;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String notes;
}
