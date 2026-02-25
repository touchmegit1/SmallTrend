package com.smalltrend.service;

import com.smalltrend.dto.shift.AttendanceResponse;
import com.smalltrend.dto.shift.AttendanceUpsertRequest;
import com.smalltrend.dto.shift.PayrollSummaryResponse;
import com.smalltrend.entity.Attendance;
import com.smalltrend.entity.SalaryConfig;
import com.smalltrend.entity.User;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.entity.WorkShiftAssignment;
import com.smalltrend.repository.AttendanceRepository;
import com.smalltrend.repository.SalaryConfigRepository;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.repository.WorkShiftAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftWorkforceService {

    private final AttendanceRepository attendanceRepository;
    private final WorkShiftAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final SalaryConfigRepository salaryConfigRepository;

    public List<AttendanceResponse> listAttendance(LocalDate date, Integer userId, String status) {
        LocalDate targetDate = Optional.ofNullable(date).orElse(LocalDate.now());

        List<WorkShiftAssignment> assignments = userId != null
                ? assignmentRepository.findByUserIdAndShiftDateBetween(userId, targetDate, targetDate)
                : assignmentRepository.findByShiftDateBetween(targetDate, targetDate);

        List<Attendance> attendances = userId != null
                ? attendanceRepository.findByUserIdAndDateBetween(userId, targetDate, targetDate)
                : attendanceRepository.findByDateBetween(targetDate, targetDate);

        Map<String, Attendance> attendanceMap = attendances.stream()
                .collect(Collectors.toMap(
                        item -> key(item.getUser().getId(), item.getDate()),
                        item -> item,
                        (first, second) -> second
                ));

        List<AttendanceResponse> rows = new ArrayList<>();

        for (WorkShiftAssignment assignment : assignments) {
            User user = assignment.getUser();
            WorkShift shift = assignment.getWorkShift();
            LocalDate shiftDate = assignment.getShiftDate();

            Attendance attendance = attendanceMap.get(key(user.getId(), shiftDate));
            String attendanceStatus = attendance != null && attendance.getStatus() != null
                    ? attendance.getStatus()
                    : "PENDING";

            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                if (!attendanceStatus.equalsIgnoreCase(status.trim())) {
                    continue;
                }
            }

            rows.add(AttendanceResponse.builder()
                    .id(attendance != null ? attendance.getId() : null)
                    .date(shiftDate)
                    .timeIn(attendance != null ? attendance.getTimeIn() : null)
                    .timeOut(attendance != null ? attendance.getTimeOut() : null)
                    .status(attendanceStatus)
                    .userId(user.getId())
                    .userName(user.getFullName())
                    .userEmail(user.getEmail())
                    .shiftId(shift != null ? shift.getId() : null)
                    .shiftName(shift != null ? shift.getShiftName() : null)
                    .shiftStartTime(shift != null ? shift.getStartTime() : null)
                    .shiftEndTime(shift != null ? shift.getEndTime() : null)
                    .notes(assignment.getNotes())
                    .build());
        }

        rows.sort(Comparator.comparing(AttendanceResponse::getDate)
                .thenComparing(AttendanceResponse::getUserName, Comparator.nullsLast(String::compareToIgnoreCase)));
        return rows;
    }

    public AttendanceResponse upsertAttendance(AttendanceUpsertRequest request) {
        if (request.getUserId() == null || request.getUserId() <= 0) {
            throw new RuntimeException("User is required");
        }
        if (request.getDate() == null) {
            throw new RuntimeException("Date is required");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Attendance attendance = attendanceRepository.findByUserIdAndDate(request.getUserId(), request.getDate())
                .orElseGet(() -> Attendance.builder()
                        .user(user)
                        .date(request.getDate())
                        .status("PENDING")
                        .build());

        attendance.setUser(user);
        attendance.setDate(request.getDate());
        attendance.setTimeIn(request.getTimeIn());
        attendance.setTimeOut(request.getTimeOut());
        attendance.setStatus(normalizeStatus(request.getStatus()));

        Attendance saved = attendanceRepository.save(attendance);

        WorkShiftAssignment assignment = assignmentRepository
                .findByUserIdAndShiftDateBetween(user.getId(), request.getDate(), request.getDate())
                .stream()
                .findFirst()
                .orElse(null);

        WorkShift shift = assignment != null ? assignment.getWorkShift() : null;

        return AttendanceResponse.builder()
                .id(saved.getId())
                .date(saved.getDate())
                .timeIn(saved.getTimeIn())
                .timeOut(saved.getTimeOut())
                .status(saved.getStatus())
                .userId(user.getId())
                .userName(user.getFullName())
                .userEmail(user.getEmail())
                .shiftId(shift != null ? shift.getId() : null)
                .shiftName(shift != null ? shift.getShiftName() : null)
                .shiftStartTime(shift != null ? shift.getStartTime() : null)
                .shiftEndTime(shift != null ? shift.getEndTime() : null)
                .notes(assignment != null ? assignment.getNotes() : null)
                .build();
    }

    public PayrollSummaryResponse buildPayrollSummary(String month, Integer userId, BigDecimal hourlyRateOverride) {
        YearMonth targetMonth = month != null && !month.isBlank()
                ? YearMonth.parse(month)
                : YearMonth.now();

        LocalDate startDate = targetMonth.atDay(1);
        LocalDate endDate = targetMonth.atEndOfMonth();

        List<WorkShiftAssignment> assignments = userId != null
                ? assignmentRepository.findByUserIdAndShiftDateBetween(userId, startDate, endDate)
                : assignmentRepository.findByShiftDateBetween(startDate, endDate);

        List<Attendance> attendances = userId != null
                ? attendanceRepository.findByUserIdAndDateBetween(userId, startDate, endDate)
                : attendanceRepository.findByDateBetween(startDate, endDate);

        Map<String, Attendance> attendanceMap = attendances.stream()
                .collect(Collectors.toMap(
                        item -> key(item.getUser().getId(), item.getDate()),
                        item -> item,
                        (first, second) -> second
                ));

        Map<Integer, PayrollAccumulator> accumulators = new HashMap<>();

        for (WorkShiftAssignment assignment : assignments) {
            User user = assignment.getUser();
            if (user == null) {
                continue;
            }

            PayrollAccumulator acc = accumulators.computeIfAbsent(user.getId(), ignored -> new PayrollAccumulator(user));
            acc.totalShifts += 1;

            Attendance attendance = attendanceMap.get(key(user.getId(), assignment.getShiftDate()));
            String attendanceStatus = attendance != null ? normalizeStatus(attendance.getStatus()) : "PENDING";

            if ("ABSENT".equals(attendanceStatus)) {
                acc.absentShifts += 1;
                continue;
            }

            if ("LATE".equals(attendanceStatus)) {
                acc.lateShifts += 1;
            }

            if ("PRESENT".equals(attendanceStatus) || "LATE".equals(attendanceStatus)) {
                acc.workedShifts += 1;
                BigDecimal shiftHours = resolveWorkedHours(assignment.getWorkShift(), attendance);
                BigDecimal regularHours = shiftHours.min(BigDecimal.valueOf(8));
                BigDecimal overtimeHours = shiftHours.subtract(regularHours).max(BigDecimal.ZERO);

                acc.workedHours = acc.workedHours.add(shiftHours);
                acc.overtimeHours = acc.overtimeHours.add(overtimeHours);
            }
        }

        List<PayrollSummaryResponse.Row> rows = accumulators.values().stream()
                .map(acc -> toPayrollRow(acc, hourlyRateOverride))
                .sorted(Comparator.comparing(PayrollSummaryResponse.Row::getFullName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .collect(Collectors.toList());

        BigDecimal totalHours = rows.stream()
                .map(PayrollSummaryResponse.Row::getWorkedHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalPayroll = rows.stream()
                .map(PayrollSummaryResponse.Row::getNetPay)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        return PayrollSummaryResponse.builder()
                .month(targetMonth.toString())
                .staffCount(rows.size())
                .totalHours(totalHours)
                .totalPayroll(totalPayroll)
                .rows(rows)
                .build();
    }

    private PayrollSummaryResponse.Row toPayrollRow(PayrollAccumulator acc, BigDecimal hourlyRateOverride) {
        BigDecimal hourlyRate = resolveHourlyRate(acc.user.getId(), hourlyRateOverride);

        BigDecimal regularPay = acc.workedHours.subtract(acc.overtimeHours)
                .multiply(hourlyRate);
        BigDecimal overtimePay = acc.overtimeHours
                .multiply(hourlyRate)
                .multiply(BigDecimal.valueOf(1.5));

        BigDecimal grossPay = regularPay.add(overtimePay);
        BigDecimal deductions = BigDecimal.valueOf(acc.absentShifts)
                .multiply(hourlyRate)
                .multiply(BigDecimal.valueOf(2));
        BigDecimal netPay = grossPay.subtract(deductions).max(BigDecimal.ZERO);

        return PayrollSummaryResponse.Row.builder()
                .userId(acc.user.getId())
                .fullName(acc.user.getFullName())
                .totalShifts(acc.totalShifts)
                .workedShifts(acc.workedShifts)
                .lateShifts(acc.lateShifts)
                .absentShifts(acc.absentShifts)
                .workedHours(acc.workedHours.setScale(2, RoundingMode.HALF_UP))
                .overtimeHours(acc.overtimeHours.setScale(2, RoundingMode.HALF_UP))
                .hourlyRate(hourlyRate.setScale(2, RoundingMode.HALF_UP))
                .grossPay(grossPay.setScale(2, RoundingMode.HALF_UP))
                .deductions(deductions.setScale(2, RoundingMode.HALF_UP))
                .netPay(netPay.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private BigDecimal resolveHourlyRate(Integer userId, BigDecimal hourlyRateOverride) {
        if (hourlyRateOverride != null && hourlyRateOverride.compareTo(BigDecimal.ZERO) > 0) {
            return hourlyRateOverride;
        }

        Optional<SalaryConfig> salaryConfig = salaryConfigRepository.findByUserId(userId);
        if (salaryConfig.isPresent()) {
            SalaryConfig config = salaryConfig.get();
            if (config.getHourlyRate() != null && config.getHourlyRate().compareTo(BigDecimal.ZERO) > 0) {
                return config.getHourlyRate();
            }
            if (config.getBaseSalary() != null && config.getBaseSalary().compareTo(BigDecimal.ZERO) > 0) {
                return config.getBaseSalary().divide(BigDecimal.valueOf(208), 2, RoundingMode.HALF_UP);
            }
        }

        return BigDecimal.valueOf(30000);
    }

    private BigDecimal resolveWorkedHours(WorkShift shift, Attendance attendance) {
        if (attendance != null && attendance.getTimeIn() != null && attendance.getTimeOut() != null) {
            LocalTime start = attendance.getTimeIn();
            LocalTime end = attendance.getTimeOut();
            long minutes = java.time.Duration.between(start, end).toMinutes();
            if (minutes < 0) {
                minutes += 24 * 60;
            }
            return BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        }

        if (shift != null && shift.getWorkingMinutes() != null) {
            return BigDecimal.valueOf(shift.getWorkingMinutes())
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        }

        return BigDecimal.ZERO;
    }

    private String key(Integer userId, LocalDate date) {
        return userId + "_" + date;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "PENDING";
        }
        return status.trim().toUpperCase();
    }

    private static class PayrollAccumulator {
        private final User user;
        private int totalShifts;
        private int workedShifts;
        private int lateShifts;
        private int absentShifts;
        private BigDecimal workedHours = BigDecimal.ZERO;
        private BigDecimal overtimeHours = BigDecimal.ZERO;

        private PayrollAccumulator(User user) {
            this.user = user;
        }
    }
}
