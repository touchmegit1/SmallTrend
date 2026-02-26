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
public class AttendanceUpsertRequest {

    private Integer userId;
    private LocalDate date;
    private LocalTime timeIn;
    private LocalTime timeOut;
    private String status;
}
