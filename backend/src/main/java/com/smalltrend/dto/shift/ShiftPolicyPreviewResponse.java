package com.smalltrend.dto.shift;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftPolicyPreviewResponse {

    private Integer shiftId;
    private String shiftName;
    private LocalDate shiftDate;

    private LocalTime expectedStart;
    private LocalTime expectedEnd;
    private LocalTime graceCutoff;
    private LocalTime allowedCheckInFrom;
    private LocalTime allowedCheckOutUntil;

    private Boolean isLate;
    private Boolean canCheckIn;
    private Boolean canCheckOut;

    private List<String> violationCodes;
    private List<String> violationMessages;

    private String policySummary;
}
