package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Tính toán lương tự động dựa trên attendance và shift
 */
@Entity
@Table(name = "payroll_calculations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollCalculation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate payPeriodStart;

    @Column(nullable = false)
    private LocalDate payPeriodEnd;

    @Column(length = 20, nullable = false)
    private String paymentCycle; // MONTHLY, WEEKLY, BI_WEEKLY

    // Thông tin làm việc thực tế
    @Column
    private Integer totalWorkedDays;

    @Column
    private Integer totalWorkedMinutes;

    @Column
    private Integer regularMinutes; // Giờ bình thường

    @Column
    private Integer overtimeMinutes; // Giờ tăng ca

    @Column
    private Integer nightShiftMinutes; // Giờ ca đêm

    @Column
    private Integer weekendMinutes; // Giờ cuối tuần

    @Column
    private Integer holidayMinutes; // Giờ ngày lễ

    @Column
    private Integer lateDays; // Số ngày đi muộn

    @Column
    private Integer absentDays; // Số ngày nghỉ (không phép)

    @Column
    private Integer leaveDays; // Số ngày nghỉ có phép

    // Tính toán lương
    @Column(precision = 15, scale = 2)
    private BigDecimal basePay; // Lương cơ bản

    @Column(precision = 15, scale = 2)
    private BigDecimal overtimePay; // Tiền tăng ca

    @Column(precision = 15, scale = 2)
    private BigDecimal nightShiftBonus; // Phụ cấp ca đêm

    @Column(precision = 15, scale = 2)
    private BigDecimal weekendBonus; // Phụ cấp cuối tuần

    @Column(precision = 15, scale = 2)
    private BigDecimal holidayBonus; // Phụ cấp ngày lễ

    @Column(precision = 15, scale = 2)
    private BigDecimal allowances; // Phụ cấp khác

    @Column(precision = 15, scale = 2)
    private BigDecimal commissionAmount; // Tiền hoa hồng

    @Column(precision = 15, scale = 2)
    private BigDecimal bonusAmount; // Tiền thưởng

    // Khấu trừ
    @Column(precision = 15, scale = 2)
    private BigDecimal latePenalty; // Phạt đi muộn

    @Column(precision = 15, scale = 2)
    private BigDecimal absentPenalty; // Phạt vắng mặt

    @Column(precision = 15, scale = 2)
    private BigDecimal socialInsurance; // BHXH

    @Column(precision = 15, scale = 2)
    private BigDecimal healthInsurance; // BHYT

    @Column(precision = 15, scale = 2)
    private BigDecimal unemploymentInsurance; // BHTN

    @Column(precision = 15, scale = 2)
    private BigDecimal personalIncomeTax; // Thuế TNCN

    @Column(precision = 15, scale = 2)
    private BigDecimal otherDeductions; // Khấu trừ khác

    // Kết quả cuối cùng
    @Column(precision = 15, scale = 2)
    private BigDecimal grossPay; // Tổng lương trước thuế

    @Column(precision = 15, scale = 2)
    private BigDecimal totalDeductions; // Tổng khấu trừ

    @Column(precision = 15, scale = 2)
    private BigDecimal netPay; // Lương thực nhận

    // Trạng thái và duyệt
    @Column(length = 20)
    private String status; // DRAFT, CALCULATED, APPROVED, PAID, DISPUTED

    @ManyToOne
    @JoinColumn(name = "calculated_by")
    private User calculatedBy;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column
    private LocalDateTime calculatedAt;

    @Column
    private LocalDateTime approvedAt;

    @Column
    private LocalDateTime paidAt;

    @Column(length = 2000)
    private String calculationDetails; // JSON chi tiết tính toán

    @Column(length = 1000)
    private String notes;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "DRAFT";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Auto calculate totals
        calculateTotals();
    }

    private void calculateTotals() {
        // Tính tổng thu nhập
        BigDecimal totalIncome = BigDecimal.ZERO;
        if (basePay != null) {
            totalIncome = totalIncome.add(basePay);
        }
        if (overtimePay != null) {
            totalIncome = totalIncome.add(overtimePay);
        }
        if (nightShiftBonus != null) {
            totalIncome = totalIncome.add(nightShiftBonus);
        }
        if (weekendBonus != null) {
            totalIncome = totalIncome.add(weekendBonus);
        }
        if (holidayBonus != null) {
            totalIncome = totalIncome.add(holidayBonus);
        }
        if (allowances != null) {
            totalIncome = totalIncome.add(allowances);
        }
        if (commissionAmount != null) {
            totalIncome = totalIncome.add(commissionAmount);
        }
        if (bonusAmount != null) {
            totalIncome = totalIncome.add(bonusAmount);
        }

        grossPay = totalIncome;

        // Tính tổng khấu trừ
        BigDecimal deductions = BigDecimal.ZERO;
        if (latePenalty != null) {
            deductions = deductions.add(latePenalty);
        }
        if (absentPenalty != null) {
            deductions = deductions.add(absentPenalty);
        }
        if (socialInsurance != null) {
            deductions = deductions.add(socialInsurance);
        }
        if (healthInsurance != null) {
            deductions = deductions.add(healthInsurance);
        }
        if (unemploymentInsurance != null) {
            deductions = deductions.add(unemploymentInsurance);
        }
        if (personalIncomeTax != null) {
            deductions = deductions.add(personalIncomeTax);
        }
        if (otherDeductions != null) {
            deductions = deductions.add(otherDeductions);
        }

        totalDeductions = deductions;

        // Lương thực nhận
        netPay = grossPay.subtract(totalDeductions);
    }
}
