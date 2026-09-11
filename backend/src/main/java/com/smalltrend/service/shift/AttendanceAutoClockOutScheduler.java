package com.smalltrend.service.shift;

import com.smalltrend.entity.Attendance;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.entity.WorkShiftAssignment;
import com.smalltrend.repository.AttendanceRepository;
import com.smalltrend.repository.WorkShiftAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Scheduler theo dõi ca đã hết giờ nhưng chưa có clock-out. Không tự động chấm
 * ra để đảm bảo chỉ kết thúc ca khi người dùng chủ động logout/clock-out.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AttendanceAutoClockOutScheduler {

    private final AttendanceRepository attendanceRepository;
    private final WorkShiftAssignmentRepository assignmentRepository;

    @Scheduled(fixedDelay = 15 * 60 * 1000) // every 15 minutes
    public void autoClockOutMissingCheckouts() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalTime now = LocalTime.now();

        // Check assignments for today and yesterday (overnight shifts)
        List<WorkShiftAssignment> assignments = assignmentRepository
                .findByShiftDateBetweenAndDeletedFalse(yesterday, today);

        int count = 0;
        for (WorkShiftAssignment assignment : assignments) {
            WorkShift shift = assignment.getWorkShift();
            if (shift == null || shift.getEndTime() == null) {
                continue;
            }

            LocalDate shiftDate = assignment.getShiftDate();
            LocalDateTime shiftEndDateTime = LocalDateTime.of(shiftDate, shift.getEndTime());
            // Handle overnight shifts
            if (shift.getStartTime() != null && !shift.getEndTime().isAfter(shift.getStartTime())) {
                shiftEndDateTime = shiftEndDateTime.plusDays(1);
            }

            // Only process if shift has ended (with 5 min buffer)
            if (LocalDateTime.now().isBefore(shiftEndDateTime.plusMinutes(5))) {
                continue;
            }

            Optional<Attendance> attendanceOpt = attendanceRepository
                    .findByUserIdAndDate(assignment.getUser().getId(), shiftDate);

            if (attendanceOpt.isEmpty()) {
                continue;
            }
            Attendance attendance = attendanceOpt.get();

            // Only auto clock-out if: has timeIn but no timeOut
            if (attendance.getTimeIn() == null || attendance.getTimeOut() != null) {
                continue;
            }

            count++;
            log.warn("Shift ended but still missing clock-out: user={} date={} shift={}",
                    assignment.getUser().getId(), shiftDate, shift.getShiftName());
        }

        if (count > 0) {
            log.warn("Attendance monitor: {} assignments ended without explicit clock-out", count);
        }
    }
}
