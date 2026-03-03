package com.smalltrend.dto.shift;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftAssignmentResponse {

    private Integer id;
    private LocalDate shiftDate;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ShiftSummary shift;
    private UserSummary user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShiftSummary {
        private Integer id;
        private String shiftCode;
        private String shiftName;
        private LocalTime startTime;
        private LocalTime endTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummary {
        private Integer id;
        private String fullName;
        private String email;
    }
}
