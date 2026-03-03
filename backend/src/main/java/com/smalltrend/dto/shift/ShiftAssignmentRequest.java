package com.smalltrend.dto.shift;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftAssignmentRequest {

    private Integer workShiftId;
    private Integer userId;
    private LocalDate shiftDate;
    private String status;
    private String notes;
}
