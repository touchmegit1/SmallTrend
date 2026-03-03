package com.smalltrend.dto.shift;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkShiftRequest {

    private String shiftCode;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
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
    private String description;
}
