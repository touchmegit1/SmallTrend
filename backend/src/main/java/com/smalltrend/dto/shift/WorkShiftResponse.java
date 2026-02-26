package com.smalltrend.dto.shift;

import com.smalltrend.entity.Role;
import com.smalltrend.entity.WorkShift;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkShiftResponse {

    private Integer id;
    private String shiftCode;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
    private Integer plannedMinutes;
    private Integer breakMinutes;
    private Integer workingMinutes;
    private String shiftType;
    private BigDecimal overtimeMultiplier;
    private BigDecimal nightShiftBonus;
    private BigDecimal weekendBonus;
    private BigDecimal holidayBonus;
    private Integer minimumStaffRequired;
    private Integer maximumStaffAllowed;
    private Boolean allowEarlyClockIn;
    private Boolean allowLateClockOut;
    private Integer earlyClockInMinutes;
    private Integer lateClockOutMinutes;
    private Integer gracePeriodMinutes;
    private String status;
    private Boolean requiresApproval;
    private Integer supervisorRoleId;
    private String supervisorRoleName;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WorkShiftResponse fromEntity(WorkShift shift) {
        Role role = shift.getSupervisorRole();
        return WorkShiftResponse.builder()
                .id(shift.getId())
                .shiftCode(shift.getShiftCode())
                .shiftName(shift.getShiftName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .breakStartTime(shift.getBreakStartTime())
                .breakEndTime(shift.getBreakEndTime())
                .plannedMinutes(shift.getPlannedMinutes())
                .breakMinutes(shift.getBreakMinutes())
                .workingMinutes(shift.getWorkingMinutes())
                .shiftType(shift.getShiftType())
                .overtimeMultiplier(shift.getOvertimeMultiplier())
                .nightShiftBonus(shift.getNightShiftBonus())
                .weekendBonus(shift.getWeekendBonus())
                .holidayBonus(shift.getHolidayBonus())
                .minimumStaffRequired(shift.getMinimumStaffRequired())
                .maximumStaffAllowed(shift.getMaximumStaffAllowed())
                .allowEarlyClockIn(shift.getAllowEarlyClockIn())
                .allowLateClockOut(shift.getAllowLateClockOut())
                .earlyClockInMinutes(shift.getEarlyClockInMinutes())
                .lateClockOutMinutes(shift.getLateClockOutMinutes())
                .gracePeriodMinutes(shift.getGracePeroidMinutes())
                .status(shift.getStatus())
                .requiresApproval(shift.getRequiresApproval())
                .supervisorRoleId(role != null ? role.getId() : null)
                .supervisorRoleName(role != null ? role.getName() : null)
                .description(shift.getDescription())
                .createdAt(shift.getCreatedAt())
                .updatedAt(shift.getUpdatedAt())
                .build();
    }
}
