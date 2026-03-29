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
 * Scheduler tự động clock-out cho nhân viên khi ca kết thúc mà chưa chấm công ra.
 * Chạy mỗi 15 phút.
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
            if (shift == null || shift.getEndTime() == null) continue;

            LocalDate shiftDate = assignment.getShiftDate();
            LocalDateTime shiftEndDateTime = LocalDateTime.of(shiftDate, shift.getEndTime());
            // Handle overnight shifts
            if (shift.getStartTime() != null && !shift.getEndTime().isAfter(shift.getStartTime())) {
                shiftEndDateTime = shiftEndDateTime.plusDays(1);
            }

            // Only process if shift has ended (with 5 min buffer)
            if (LocalDateTime.now().isBefore(shiftEndDateTime.plusMinutes(5))) continue;

            Optional<Attendance> attendanceOpt = attendanceRepository
                    .findByUserIdAndDate(assignment.getUser().getId(), shiftDate);

            if (attendanceOpt.isEmpty()) continue;
            Attendance attendance = attendanceOpt.get();

            // Only auto clock-out if: has timeIn but no timeOut
            if (attendance.getTimeIn() == null || attendance.getTimeOut() != null) continue;

            String status = attendance.getStatus() == null ? "" : attendance.getStatus().toUpperCase();
            if ("PRESENT".equals(status) || "LATE".equals(status)) continue; // already completed

            // Auto set timeOut = shift end time
            attendance.setTimeOut(shift.getEndTime());
            // Determine status based on timeIn vs shift start
            LocalTime graceCutoff = shift.getStartTime() != null
                    ? shift.getStartTime().plusMinutes(shift.getGracePeroidMinutes() != null ? shift.getGracePeroidMinutes() : 0)
                    : null;
            if (graceCutoff != null && attendance.getTimeIn().isAfter(graceCutoff)) {
                attendance.setStatus("LATE");
            } else {
                attendance.setStatus("PRESENT");
            }

            attendanceRepository.save(attendance);

            // Mark assignment as COMPLETED
            assignment.setStatus("COMPLETED");
            assignmentRepository.save(assignment);

            count++;
            log.info("Auto clock-out: user={} date={} shift={} timeOut={}",
                    assignment.getUser().getId(), shiftDate, shift.getShiftName(), shift.getEndTime());
        }

        if (count > 0) {
            log.info("Auto clock-out scheduler: processed {} records", count);
        }
    }
}
