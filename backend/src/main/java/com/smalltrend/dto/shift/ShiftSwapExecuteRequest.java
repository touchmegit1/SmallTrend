package com.smalltrend.dto.shift;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftSwapExecuteRequest {

    private Integer requesterAssignmentId;
    private Integer targetAssignmentId;
    private Integer accepterUserId;
    private Long ticketId;
    private String note;
}
