package com.smalltrend.service;

import com.smalltrend.dto.shift.AttendanceResponse;
import com.smalltrend.dto.shift.AttendanceUpsertRequest;
import com.smalltrend.dto.shift.PayrollSummaryResponse;
import com.smalltrend.entity.Attendance;
import com.smalltrend.entity.PayrollCalculation;
import com.smalltrend.entity.User;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.entity.WorkShiftAssignment;
import com.smalltrend.entity.enums.SalaryType;
import com.smalltrend.repository.AttendanceRepository;
import com.smalltrend.repository.PayrollCalculationRepository;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.repository.WorkShiftAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftWorkforceService {

    private final AttendanceRepository attendanceRepository;
    private final WorkShiftAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final PayrollCalculationRepository payrollCalculationRepository;

    public List<AttendanceResponse> listAttendance(LocalDate date, LocalDate startDate, LocalDate endDate, Integer userId, String status) {
        LocalDate targetDate = Optional.ofNullable(date).orElse(LocalDate.now());
        LocalDate fromDate = Optional.ofNullable(startDate).orElse(targetDate);
        LocalDate toDate = Optional.ofNullable(endDate).orElse(targetDate);

        if (fromDate.isAfter(toDate)) {
            throw new RuntimeException("Start date must be before or equal to end date");
        }

        List<WorkShiftAssignment> assignments = userId != null
                ? assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(userId, fromDate, toDate)
                : assignmentRepository.findByShiftDateBetweenAndDeletedFalse(fromDate, toDate);

        List<Attendance> attendances = userId != null
                ? attendanceRepository.findByUserIdAndDateBetween(userId, fromDate, toDate)
                : attendanceRepository.findByDateBetween(fromDate, toDate);

        Map<String, Attendance> attendanceMap = attendances.stream()
                .collect(Collectors.toMap(
                        item -> key(item.getUser().getId(), item.getDate()),
                        item -> item,
                        (first, second) -> second
                ));

        List<AttendanceResponse> rows = new ArrayList<>();

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        for (WorkShiftAssignment assignment : assignments) {
            User user = assignment.getUser();
            WorkShift shift = assignment.getWorkShift();
            LocalDate shiftDate = assignment.getShiftDate();

            Attendance attendance = attendanceMap.get(key(user.getId(), shiftDate));
            String attendanceStatus = resolveAttendanceStatus(attendance, assignment, today, now);

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

        WorkShiftAssignment assignment = assignmentRepository
                .findByUserIdAndShiftDateBetweenAndDeletedFalse(user.getId(), request.getDate(), request.getDate())
                .stream()
                .findFirst()
                .orElse(null);

        if (assignment != null && assignment.getWorkShift() != null) {
            WorkShift shift = assignment.getWorkShift();
            attendance.setAssignmentIdSnapshot(assignment.getId());
            attendance.setShiftIdSnapshot(shift.getId());
            attendance.setShiftNameSnapshot(shift.getShiftName());
            attendance.setShiftStartSnapshot(shift.getStartTime());
            attendance.setShiftEndSnapshot(shift.getEndTime());
            attendance.setShiftWorkingMinutesSnapshot(shift.getWorkingMinutes());
        }

        Attendance saved = attendanceRepository.save(attendance);

        if (assignment != null && shouldMarkAssignmentCompleted(saved)) {
            assignment.setStatus("COMPLETED");
            assignmentRepository.save(assignment);
        }

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

    public PayrollSummaryResponse buildPayrollSummary(String month,
            String fromMonth,
            String toMonth,
            Integer userId,
            BigDecimal hourlyRateOverride) {
        YearMonth startMonth;
        YearMonth endMonth;

        if (fromMonth != null && !fromMonth.isBlank()) {
            startMonth = YearMonth.parse(fromMonth);
        } else if (month != null && !month.isBlank()) {
            startMonth = YearMonth.parse(month);
        } else {
            startMonth = YearMonth.now();
        }

        if (toMonth != null && !toMonth.isBlank()) {
            endMonth = YearMonth.parse(toMonth);
        } else {
            endMonth = startMonth;
        }

        if (startMonth.isAfter(endMonth)) {
            throw new RuntimeException("fromMonth must be before or equal to toMonth");
        }

        LocalDate startDate = startMonth.atDay(1);
        LocalDate endDate = endMonth.atEndOfMonth();

        List<WorkShiftAssignment> assignments = userId != null
                ? assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(userId, startDate, endDate)
                : assignmentRepository.findByShiftDateBetweenAndDeletedFalse(startDate, endDate);

        List<Attendance> attendances = userId != null
                ? attendanceRepository.findByUserIdAndDateBetween(userId, startDate, endDate)
                : attendanceRepository.findByDateBetween(startDate, endDate);

        Map<String, Attendance> attendanceMap = attendances.stream()
                .collect(Collectors.toMap(
                        item -> key(item.getUser().getId(), item.getDate()),
                        item -> item,
                        (first, second) -> second
                ));

        List<PayrollCalculation> paidPayrolls = userId != null
                ? payrollCalculationRepository.findByUserIdAndPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(
                        userId,
                        startDate,
                        endDate)
                : payrollCalculationRepository.findByPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(
                        startDate,
                        endDate);

        Map<String, Boolean> paidMonthMap = paidPayrolls.stream()
                .filter(item -> "PAID".equalsIgnoreCase(Optional.ofNullable(item.getStatus()).orElse("")))
                .filter(item -> item.getUser() != null && item.getUser().getId() != null)
                .filter(item -> item.getPayPeriodStart() != null)
                .collect(Collectors.toMap(
                        item -> key(item.getUser().getId(), item.getPayPeriodStart()),
                        item -> true,
                        (first, second) -> first));

        Map<Integer, PayrollAccumulator> accumulators = new HashMap<>();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        for (WorkShiftAssignment assignment : assignments) {
            User user = assignment.getUser();
            if (user == null) {
                continue;
            }

            if (Boolean.TRUE.equals(paidMonthMap.get(key(user.getId(), assignment.getShiftDate().withDayOfMonth(1))))) {
                continue;
            }

            PayrollAccumulator acc = accumulators.computeIfAbsent(user.getId(), ignored -> new PayrollAccumulator(user));
            acc.totalShifts += 1;

            Attendance attendance = attendanceMap.get(key(user.getId(), assignment.getShiftDate()));
            String attendanceStatus = resolveAttendanceStatus(attendance, assignment, today, now);

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
                BigDecimal bonusFactor = resolveShiftBonusFactor(assignment.getWorkShift());
                BigDecimal overtimeFactor = resolveShiftOvertimeFactor(assignment.getWorkShift());

                acc.workedHours = acc.workedHours.add(shiftHours);
                acc.overtimeHours = acc.overtimeHours.add(overtimeHours);
                acc.adjustedRegularHours = acc.adjustedRegularHours.add(regularHours.multiply(bonusFactor));
                acc.adjustedOvertimeHours = acc.adjustedOvertimeHours.add(overtimeHours.multiply(bonusFactor).multiply(overtimeFactor));
            }
        }

        Map<String, LocalDateTime> paidAtMonthMap = paidPayrolls.stream()
                .filter(item -> "PAID".equalsIgnoreCase(Optional.ofNullable(item.getStatus()).orElse("")))
                .filter(item -> item.getUser() != null && item.getUser().getId() != null)
                .filter(item -> item.getPayPeriodStart() != null)
                .filter(item -> item.getPaidAt() != null)
                .collect(Collectors.toMap(
                        item -> key(item.getUser().getId(), item.getPayPeriodStart()),
                        PayrollCalculation::getPaidAt,
                        (first, second) -> first));

        List<PayrollSummaryResponse.Row> rows = accumulators.values().stream()
                .map(acc -> toPayrollRow(acc, hourlyRateOverride, endDate, paidMonthMap, paidAtMonthMap))
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
                .month(startMonth.equals(endMonth)
                        ? startMonth.toString()
                        : startMonth + "~" + endMonth)
                .staffCount(rows.size())
                .totalHours(totalHours)
                .totalPayroll(totalPayroll)
                .rows(rows)
                .build();
    }

    public String markPayrollAsPaid(String month, Integer userId) {
        if (month == null || month.isBlank()) {
            throw new RuntimeException("Month is required");
        }

        YearMonth targetMonth = YearMonth.parse(month);
        LocalDate periodStart = targetMonth.atDay(1);
        LocalDate periodEnd = targetMonth.atEndOfMonth();

        List<WorkShiftAssignment> assignments = userId != null
                ? assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(userId, periodStart, periodEnd)
                : assignmentRepository.findByShiftDateBetweenAndDeletedFalse(periodStart, periodEnd);

        Map<Integer, User> assignmentUsers = assignments.stream()
                .map(WorkShiftAssignment::getUser)
                .filter(user -> user != null && user.getId() != null)
                .collect(Collectors.toMap(User::getId, user -> user, (first, second) -> first));

        if (assignmentUsers.isEmpty()) {
            return "Không có dữ liệu phân ca để xác nhận thanh toán tháng " + month;
        }

        PayrollSummaryResponse snapshot = buildPayrollSummary(month, null, null, userId, null);
        Map<Integer, PayrollSummaryResponse.Row> rowMap = snapshot.getRows().stream()
                .collect(Collectors.toMap(PayrollSummaryResponse.Row::getUserId, row -> row, (first, second) -> first));

        LocalDateTime now = LocalDateTime.now();
        int updated = 0;

        for (User user : assignmentUsers.values()) {
            PayrollCalculation calculation = payrollCalculationRepository
                    .findByUserIdAndPayPeriodStartAndPayPeriodEnd(user.getId(), periodStart, periodEnd)
                    .orElseGet(() -> PayrollCalculation.builder()
                    .user(user)
                    .payPeriodStart(periodStart)
                    .payPeriodEnd(periodEnd)
                    .paymentCycle("MONTHLY")
                    .build());

            PayrollSummaryResponse.Row row = rowMap.get(user.getId());

            calculation.setUser(user);
            calculation.setPayPeriodStart(periodStart);
            calculation.setPayPeriodEnd(periodEnd);
            calculation.setPaymentCycle("MONTHLY");
            calculation.setStatus("PAID");
            calculation.setPaidAt(now);
            calculation.setCalculatedAt(now);
            calculation.setBasePay(row != null ? row.getGrossPay() : BigDecimal.ZERO);
            calculation.setTotalDeductions(row != null ? row.getDeductions() : BigDecimal.ZERO);
            calculation.setNetPay(row != null ? row.getNetPay() : BigDecimal.ZERO);

            payrollCalculationRepository.save(calculation);
            updated += 1;
        }

        return "Đã xác nhận thanh toán lương tháng " + month + " cho " + updated + " nhân viên";
    }

    public Map<String, Object> buildPayrollPaymentStatus(
            String month,
            String fromMonth,
            String toMonth,
            LocalDate paymentDueDate,
            Integer userId) {
        YearMonth startMonth;
        YearMonth endMonth;

        if (fromMonth != null && !fromMonth.isBlank()) {
            startMonth = YearMonth.parse(fromMonth);
        } else if (month != null && !month.isBlank()) {
            startMonth = YearMonth.parse(month);
        } else {
            startMonth = YearMonth.now();
        }

        if (toMonth != null && !toMonth.isBlank()) {
            endMonth = YearMonth.parse(toMonth);
        } else {
            endMonth = startMonth;
        }

        if (!startMonth.equals(endMonth)) {
            return Map.of(
                    "month", startMonth + "~" + endMonth,
                    "isPaid", false,
                    "overdueDays", 0,
                    "message", "Chỉ áp dụng chốt thanh toán khi chọn đúng 1 tháng",
                    "supported", false);
        }

        LocalDate periodStart = startMonth.atDay(1);
        LocalDate periodEnd = startMonth.atEndOfMonth();
        LocalDate dueDate = paymentDueDate != null ? paymentDueDate : periodEnd.plusDays(5);

        List<WorkShiftAssignment> assignments = userId != null
                ? assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(userId, periodStart, periodEnd)
                : assignmentRepository.findByShiftDateBetweenAndDeletedFalse(periodStart, periodEnd);

        Set<Integer> assignedUserIds = assignments.stream()
                .map(WorkShiftAssignment::getUser)
                .filter(user -> user != null && user.getId() != null)
                .map(User::getId)
                .collect(Collectors.toSet());

        List<PayrollCalculation> calculations = userId != null
                ? payrollCalculationRepository.findByUserIdAndPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(
                        userId,
                        periodStart,
                        periodEnd)
                : payrollCalculationRepository.findByPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(
                        periodStart,
                        periodEnd);

        Set<Integer> paidUserIds = calculations.stream()
                .filter(item -> "PAID".equalsIgnoreCase(Optional.ofNullable(item.getStatus()).orElse("")))
                .map(PayrollCalculation::getUser)
                .filter(user -> user != null && user.getId() != null)
                .map(User::getId)
                .collect(Collectors.toCollection(HashSet::new));

        boolean hasAssignments = !assignedUserIds.isEmpty();
        boolean isPaid = hasAssignments && paidUserIds.containsAll(assignedUserIds);

        int overdueDays = 0;
        if (!isPaid && LocalDate.now().isAfter(dueDate)) {
            overdueDays = (int) ChronoUnit.DAYS.between(dueDate, LocalDate.now());
        }

        int paidCount = (int) assignedUserIds.stream().filter(paidUserIds::contains).count();
        int remainingCount = Math.max(0, assignedUserIds.size() - paidCount);

        return Map.of(
                "month", startMonth.toString(),
                "dueDate", dueDate,
                "isPaid", isPaid,
                "overdueDays", overdueDays,
                "assignedStaff", assignedUserIds.size(),
                "paidStaff", paidCount,
                "remainingStaff", remainingCount,
                "supported", true,
                "message", !hasAssignments
                        ? "Không có phân ca trong tháng này"
                        : (isPaid ? "Đã thanh toán lương tháng" : "Chưa thanh toán lương tháng"));
    }

    private PayrollSummaryResponse.Row toPayrollRow(PayrollAccumulator acc,
            BigDecimal hourlyRateOverride,
            LocalDate periodEnd,
            Map<String, Boolean> paidMonthMap,
            Map<String, LocalDateTime> paidAtMonthMap) {
        SalaryProfile salaryProfile = resolveSalaryProfile(acc.user.getId(), hourlyRateOverride);

        BigDecimal hourlyRate = salaryProfile.hourlyRate;
        BigDecimal regularPay = BigDecimal.ZERO;
        BigDecimal overtimePay = BigDecimal.ZERO;
        BigDecimal grossPay;
        BigDecimal deductions = BigDecimal.ZERO;
        BigDecimal netPay;
        boolean eligibleForMonthlySalary = true;

        if (salaryProfile.salaryType == SalaryType.HOURLY) {
            regularPay = acc.adjustedRegularHours.max(BigDecimal.ZERO)
                    .multiply(hourlyRate);
            overtimePay = acc.adjustedOvertimeHours.max(BigDecimal.ZERO)
                    .multiply(hourlyRate);
            grossPay = regularPay.add(overtimePay);
            deductions = BigDecimal.valueOf(acc.absentShifts)
                    .multiply(hourlyRate)
                    .multiply(BigDecimal.valueOf(2));
            netPay = grossPay.subtract(deductions).max(BigDecimal.ZERO);
        } else if (salaryProfile.salaryType == SalaryType.MONTHLY_MIN_SHIFTS) {
            int minRequiredShifts = Optional.ofNullable(salaryProfile.minRequiredShifts).orElse(0);
            int eligibleShiftCount = salaryProfile.countLateAsPresent
                    ? acc.workedShifts
                    : Math.max(0, acc.workedShifts - acc.lateShifts);
            eligibleForMonthlySalary = eligibleShiftCount >= minRequiredShifts;
            grossPay = eligibleForMonthlySalary ? salaryProfile.baseSalary : BigDecimal.ZERO;
            netPay = grossPay;
        } else {
            grossPay = salaryProfile.baseSalary;
            netPay = grossPay;
        }

        String paidKey = key(acc.user.getId(), periodEnd.withDayOfMonth(1));
        boolean isPaid = Boolean.TRUE.equals(paidMonthMap.get(paidKey));
        LocalDate dueDate = periodEnd.plusDays(5);
        int overdueDays = !isPaid && LocalDate.now().isAfter(dueDate)
                ? (int) ChronoUnit.DAYS.between(dueDate, LocalDate.now())
                : 0;
        boolean attendanceFlag = acc.absentShifts > 0 || acc.lateShifts > 0;

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
                .salaryType(salaryProfile.salaryType.name())
                .minRequiredShifts(salaryProfile.minRequiredShifts)
                .eligibleForMonthlySalary(eligibleForMonthlySalary)
                .baseSalary(salaryProfile.baseSalary.setScale(2, RoundingMode.HALF_UP))
                .grossPay(grossPay.setScale(2, RoundingMode.HALF_UP))
                .deductions(deductions.setScale(2, RoundingMode.HALF_UP))
                .netPay(netPay.setScale(2, RoundingMode.HALF_UP))
                .isPaid(isPaid)
                .paidAt(paidAtMonthMap.get(paidKey))
                .overdueDays(overdueDays)
                .attendanceFlag(attendanceFlag)
                .build();
    }

    private BigDecimal resolveShiftBonusFactor(WorkShift shift) {
        if (shift == null) {
            return BigDecimal.ONE;
        }

        BigDecimal totalBonusPercent = BigDecimal.ZERO;
        if (shift.getNightShiftBonus() != null) {
            totalBonusPercent = totalBonusPercent.add(shift.getNightShiftBonus());
        }
        if (shift.getWeekendBonus() != null) {
            totalBonusPercent = totalBonusPercent.add(shift.getWeekendBonus());
        }
        if (shift.getHolidayBonus() != null) {
            totalBonusPercent = totalBonusPercent.add(shift.getHolidayBonus());
        }

        return BigDecimal.ONE.add(totalBonusPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
    }

    private BigDecimal resolveShiftOvertimeFactor(WorkShift shift) {
        if (shift == null || shift.getOvertimeMultiplier() == null || shift.getOvertimeMultiplier().compareTo(BigDecimal.ONE) < 0) {
            return BigDecimal.valueOf(1.5);
        }

        return shift.getOvertimeMultiplier();
    }

    private SalaryProfile resolveSalaryProfile(Integer userId, BigDecimal hourlyRateOverride) {
        if (hourlyRateOverride != null && hourlyRateOverride.compareTo(BigDecimal.ZERO) > 0) {
            return new SalaryProfile(
                    SalaryType.HOURLY,
                    BigDecimal.ZERO,
                    hourlyRateOverride,
                    null,
                    true,
                    BigDecimal.valueOf(208));
        }

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            SalaryType salaryType = Optional.ofNullable(user.getSalaryType()).orElse(SalaryType.MONTHLY);
            BigDecimal baseSalary = Optional.ofNullable(user.getBaseSalary()).orElse(BigDecimal.ZERO);
            BigDecimal workingHoursPerMonth = Optional.ofNullable(user.getWorkingHoursPerMonth())
                    .filter(hours -> hours.compareTo(BigDecimal.ZERO) > 0)
                    .orElse(BigDecimal.valueOf(208));
            BigDecimal hourlyRate = Optional.ofNullable(user.getHourlyRate()).orElse(BigDecimal.ZERO);

            if (hourlyRate.compareTo(BigDecimal.ZERO) <= 0 && baseSalary.compareTo(BigDecimal.ZERO) > 0) {
                hourlyRate = baseSalary.divide(workingHoursPerMonth, 2, RoundingMode.HALF_UP);
            }

            if (baseSalary.compareTo(BigDecimal.ZERO) > 0 || hourlyRate.compareTo(BigDecimal.ZERO) > 0) {
                return new SalaryProfile(
                        salaryType,
                        baseSalary,
                        hourlyRate.compareTo(BigDecimal.ZERO) > 0 ? hourlyRate : BigDecimal.valueOf(30000),
                        user.getMinRequiredShifts(),
                        Optional.ofNullable(user.getCountLateAsPresent()).orElse(true),
                        workingHoursPerMonth);
            }
        }

        return new SalaryProfile(
                SalaryType.HOURLY,
                BigDecimal.ZERO,
                BigDecimal.valueOf(30000),
                null,
                true,
                BigDecimal.valueOf(208));
    }

    private BigDecimal resolveWorkedHours(WorkShift shift, Attendance attendance) {
        if (attendance != null && attendance.getTimeIn() != null && attendance.getTimeOut() != null) {
            LocalTime start = attendance.getTimeIn();
            LocalTime end = attendance.getTimeOut();
            long minutes = java.time.Duration.between(start, end).toMinutes();
            if (minutes < 0) {
                minutes += 24 * 60;
            }

            if (shift != null && shift.getBreakStartTime() != null && shift.getBreakEndTime() != null) {
                minutes -= calculateOverlapMinutes(start, end, shift.getBreakStartTime(), shift.getBreakEndTime());
            }

            if (minutes < 0) {
                minutes = 0;
            }

            return BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        }

        if (attendance != null && attendance.getTimeIn() != null && attendance.getTimeOut() == null) {
            return BigDecimal.ZERO;
        }

        if (attendance != null && attendance.getShiftWorkingMinutesSnapshot() != null) {
            return BigDecimal.valueOf(attendance.getShiftWorkingMinutesSnapshot())
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        }

        if (shift != null && shift.getWorkingMinutes() != null) {
            return BigDecimal.valueOf(shift.getWorkingMinutes())
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        }

        return BigDecimal.ZERO;
    }

    private long calculateOverlapMinutes(LocalTime windowStart, LocalTime windowEnd, LocalTime breakStart, LocalTime breakEnd) {
        int dayMinutes = 24 * 60;

        long start = windowStart.toSecondOfDay() / 60;
        long end = windowEnd.toSecondOfDay() / 60;
        long breakFrom = breakStart.toSecondOfDay() / 60;
        long breakTo = breakEnd.toSecondOfDay() / 60;

        if (end <= start) {
            end += dayMinutes;
        }
        if (breakTo <= breakFrom) {
            breakTo += dayMinutes;
        }

        long overlap = overlap(start, end, breakFrom, breakTo);
        overlap += overlap(start, end, breakFrom + dayMinutes, breakTo + dayMinutes);
        overlap += overlap(start + dayMinutes, end + dayMinutes, breakFrom, breakTo);

        return Math.max(overlap, 0);
    }

    private long overlap(long aStart, long aEnd, long bStart, long bEnd) {
        long start = Math.max(aStart, bStart);
        long end = Math.min(aEnd, bEnd);
        return Math.max(0, end - start);
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

    private boolean shouldMarkAssignmentCompleted(Attendance attendance) {
        if (attendance == null || attendance.getTimeOut() == null) {
            return false;
        }

        String normalized = Optional.ofNullable(attendance.getStatus()).orElse("").trim().toUpperCase();
        return "PRESENT".equals(normalized) || "LATE".equals(normalized);
    }

    private String resolveAttendanceStatus(Attendance attendance,
            WorkShiftAssignment assignment,
            LocalDate today,
            LocalTime now) {
        if (attendance != null) {
            String normalizedStatus = normalizeStatus(attendance.getStatus());
            if (!"PENDING".equals(normalizedStatus)) {
                return normalizedStatus;
            }

            if (hasShiftEndedWithoutCheckIn(attendance.getTimeIn(), assignment, today, now)) {
                return "ABSENT";
            }

            return "PENDING";
        }

        if (hasShiftEndedWithoutCheckIn(null, assignment, today, now)) {
            return "ABSENT";
        }

        return "PENDING";
    }

    private boolean hasShiftEndedWithoutCheckIn(LocalTime checkIn,
            WorkShiftAssignment assignment,
            LocalDate today,
            LocalTime now) {
        if (checkIn != null || assignment == null || assignment.getShiftDate() == null) {
            return false;
        }

        LocalDate shiftDate = assignment.getShiftDate();
        WorkShift shift = assignment.getWorkShift();
        if (shift == null || shift.getEndTime() == null) {
            return false;
        }

        LocalDateTime shiftEndDateTime = LocalDateTime.of(shiftDate, shift.getEndTime());
        if (shift.getStartTime() != null && !shift.getEndTime().isAfter(shift.getStartTime())) {
            shiftEndDateTime = shiftEndDateTime.plusDays(1);
        }

        LocalDateTime nowDateTime = LocalDateTime.of(today, now);

        return !nowDateTime.isBefore(shiftEndDateTime);
    }

    private static class PayrollAccumulator {

        private final User user;
        private int totalShifts;
        private int workedShifts;
        private int lateShifts;
        private int absentShifts;
        private BigDecimal workedHours = BigDecimal.ZERO;
        private BigDecimal overtimeHours = BigDecimal.ZERO;
        private BigDecimal adjustedRegularHours = BigDecimal.ZERO;
        private BigDecimal adjustedOvertimeHours = BigDecimal.ZERO;

        private PayrollAccumulator(User user) {
            this.user = user;
        }
    }

    private static class SalaryProfile {

        private final SalaryType salaryType;
        private final BigDecimal baseSalary;
        private final BigDecimal hourlyRate;
        private final Integer minRequiredShifts;
        private final boolean countLateAsPresent;

        private SalaryProfile(SalaryType salaryType,
                BigDecimal baseSalary,
                BigDecimal hourlyRate,
                Integer minRequiredShifts,
                boolean countLateAsPresent,
                BigDecimal ignoredWorkingHoursPerMonth) {
            this.salaryType = salaryType;
            this.baseSalary = baseSalary;
            this.hourlyRate = hourlyRate;
            this.minRequiredShifts = minRequiredShifts;
            this.countLateAsPresent = countLateAsPresent;
        }
    }
}
