package com.smalltrend.dto.shift;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {

    private Integer id;
    private LocalDate date;
    private LocalTime timeIn;
    private LocalTime timeOut;
    private String status;
    private Integer userId;
    private String userName;
    private String userEmail;
    private Integer shiftId;
    private String shiftName;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private String notes;
}
