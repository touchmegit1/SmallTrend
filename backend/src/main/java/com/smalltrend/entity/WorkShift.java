package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Ca làm việc chuyên nghiệp với logic tính lương chặt chẽ
 */
@Entity
@Table(name = "work_shifts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String shiftCode; // SFT-M-001 (Morning), SFT-A-001 (Afternoon), SFT-N-001 (Night)

    @Column(nullable = false, length = 100)
    private String shiftName; // Ca sáng, Ca chiều, Ca đêm

    @Column(nullable = false)
    private LocalTime startTime; // 08:00:00

    @Column(nullable = false)
    private LocalTime endTime; // 16:00:00

    @Column
    private LocalTime breakStartTime; // 12:00:00

    @Column
    private LocalTime breakEndTime; // 13:00:00

    @Column
    private Integer plannedMinutes; // 480 phút = 8 giờ

    @Column
    private Integer breakMinutes; // 60 phút nghỉ trưa

    @Column
    private Integer workingMinutes; // 420 phút làm việc thực tế

    @Column(length = 20)
    private String shiftType; // REGULAR, WEEKEND, HOLIDAY, NIGHT

    @Column(precision = 5, scale = 2)
    private BigDecimal overtimeMultiplier; // 1.5x cho overtime, 2.0x cho chủ nhật

    @Column(precision = 5, scale = 2)
    private BigDecimal nightShiftBonus; // Phụ cấp ca đêm (%)

    @Column(precision = 5, scale = 2)
    private BigDecimal weekendBonus; // Phụ cấp cuối tuần (%)

    @Column(precision = 5, scale = 2)
    private BigDecimal holidayBonus; // Phụ cấp ngày lễ (%)

    @Column
    private Integer minimumStaffRequired; // Tối thiểu số nhân viên/ca

    @Column
    private Integer maximumStaffAllowed; // Tối đa số nhân viên/ca

    @Column
    private Boolean allowEarlyClockIn; // Cho phép chấm công sớm

    @Column
    private Boolean allowLateClockOut; // Cho phép về muộn

    @Column
    private Integer earlyClockInMinutes; // Cho phép chấm công sớm tối đa (phút)

    @Column
    private Integer lateClockOutMinutes; // Cho phép về muộn tối đa (phút)

    @Column
    private Integer gracePeroidMinutes; // Thời gian ân hạn (đi muộn không bị trừ lương)

    @Column(length = 20)
    private String status; // ACTIVE, INACTIVE, SEASONAL

    @Column
    private Boolean requiresApproval; // Ca này có cần duyệt không

    @ManyToOne
    @JoinColumn(name = "supervisor_role_id")
    private Role supervisorRole; // Role nào được giám sát ca này

    @Column(length = 1000)
    private String description;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        calculateWorkingMinutes();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateWorkingMinutes();
    }

    private void calculateWorkingMinutes() {
        if (startTime != null && endTime != null) {
            // Tính tổng phút trong ca
            plannedMinutes = (int) java.time.Duration.between(startTime, endTime).toMinutes();

            // Trừ đi thời gian nghỉ
            if (breakStartTime != null && breakEndTime != null) {
                breakMinutes = (int) java.time.Duration.between(breakStartTime, breakEndTime).toMinutes();
                workingMinutes = plannedMinutes - breakMinutes;
            } else {
                breakMinutes = 0;
                workingMinutes = plannedMinutes;
            }
        }
    }
}
