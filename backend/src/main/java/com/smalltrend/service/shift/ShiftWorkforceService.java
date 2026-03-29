package com.smalltrend.service.shift;

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
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class ShiftWorkforceService {

    private static final BigDecimal ABSENT_PENALTY_AMOUNT = new BigDecimal("200000");
    private static final BigDecimal LATE_PENALTY_AMOUNT = new BigDecimal("50000");

    private final AttendanceRepository attendanceRepository;
    private final WorkShiftAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final PayrollCalculationRepository payrollCalculationRepository;
    private final JavaMailSender mailSender;

    @Value("${app.notifications.price-expiry.recipient:admin.smalltrend.swp@gmail.com}")
    private String adminEmails;

    @Value("${spring.mail.username:}")
    private String senderEmail;

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
            String attendanceStatus = resolveAttendanceStatusForMonitoring(attendance, assignment, today, now);

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

        WorkShiftAssignment assignment = assignmentRepository
                .findByUserIdAndShiftDateBetweenAndDeletedFalse(user.getId(), request.getDate(), request.getDate())
                .stream()
                .findFirst()
                .orElse(null);

        validateAttendanceTimeline(request.getTimeIn(), request.getTimeOut(), assignment);

        attendance.setStatus(resolveAttendanceStatusForUpsert(request.getStatus(), request.getTimeIn(), request.getTimeOut(), assignment));

        if (request.getTimeOut() != null && !shouldMarkAssignmentCompleted(attendance)) {
            attendance.setStatus("PRESENT");
        }

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

    public AttendanceResponse clockIn(AttendanceUpsertRequest request) {
        if (request.getUserId() == null || request.getUserId() <= 0) {
            throw new RuntimeException("User is required");
        }

        LocalDate targetDate = Optional.ofNullable(request.getDate()).orElse(LocalDate.now());
        LocalTime targetClockInTime = Optional.ofNullable(request.getTimeIn()).orElse(LocalTime.now().withSecond(0).withNano(0));

        Attendance existing = attendanceRepository.findByUserIdAndDate(request.getUserId(), targetDate).orElse(null);

        AttendanceUpsertRequest upsert = AttendanceUpsertRequest.builder()
                .userId(request.getUserId())
                .date(targetDate)
                .timeIn(existing != null && existing.getTimeIn() != null ? existing.getTimeIn() : targetClockInTime)
                .timeOut(null)
                .status("PRESENT")
                .build();

        return upsertAttendance(upsert);
    }

    public AttendanceResponse clockOut(AttendanceUpsertRequest request) {
        if (request.getUserId() == null || request.getUserId() <= 0) {
            throw new RuntimeException("User is required");
        }

        LocalDate targetDate = Optional.ofNullable(request.getDate()).orElse(LocalDate.now());
        LocalTime targetClockOutTime = Optional.ofNullable(request.getTimeOut()).orElse(LocalTime.now().withSecond(0).withNano(0));

        WorkShiftAssignment assignment = assignmentRepository
                .findByUserIdAndShiftDateBetweenAndDeletedFalse(request.getUserId(), targetDate, targetDate)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm để chấm công ra"));

        if (!hasShiftEnded(assignment, LocalDate.now(), LocalTime.now())) {
            throw new RuntimeException("Chưa hết ca, chưa thể chấm công ra");
        }

        Attendance existing = attendanceRepository.findByUserIdAndDate(request.getUserId(), targetDate).orElse(null);
        LocalTime timeIn = existing != null && existing.getTimeIn() != null ? existing.getTimeIn() : targetClockOutTime;

        AttendanceUpsertRequest upsert = AttendanceUpsertRequest.builder()
                .userId(request.getUserId())
                .date(targetDate)
                .timeIn(timeIn)
                .timeOut(targetClockOutTime)
                .status("PRESENT")
                .build();

        return upsertAttendance(upsert);
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
            String attendanceStatus = resolveAttendanceStatusForPayroll(attendance, assignment, today, now);

            if ("ON_LEAVE".equals(attendanceStatus)) {
                acc.leaveDays += 1;
                continue;
            }

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

    public String markPayrollAsPaid(String month, Integer userId, String callerEmail) {
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

        // Send email notification to admin
        try {
            sendPayrollEmailToAdmin(month, snapshot, updated, callerEmail);
        } catch (Exception e) {
            log.error("Failed to send payroll email notification for month {}", month, e);
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

        // Fixed penalties: absent = 200k, late = 50k
        BigDecimal absentPenalty = ABSENT_PENALTY_AMOUNT.multiply(BigDecimal.valueOf(acc.absentShifts));
        BigDecimal latePenalty = LATE_PENALTY_AMOUNT.multiply(BigDecimal.valueOf(acc.lateShifts));

        if (salaryProfile.salaryType == SalaryType.HOURLY) {
            regularPay = acc.adjustedRegularHours.max(BigDecimal.ZERO)
                    .multiply(hourlyRate);
            overtimePay = acc.adjustedOvertimeHours.max(BigDecimal.ZERO)
                    .multiply(hourlyRate);
            grossPay = regularPay.add(overtimePay);
            deductions = absentPenalty.add(latePenalty);
            netPay = grossPay.subtract(deductions).max(BigDecimal.ZERO);
        } else if (salaryProfile.salaryType == SalaryType.MONTHLY_MIN_SHIFTS) {
            int minRequiredShifts = Optional.ofNullable(salaryProfile.minRequiredShifts).orElse(0);
            int eligibleShiftCount = salaryProfile.countLateAsPresent
                    ? acc.workedShifts
                    : Math.max(0, acc.workedShifts - acc.lateShifts);
            eligibleForMonthlySalary = eligibleShiftCount >= minRequiredShifts;
            grossPay = eligibleForMonthlySalary ? salaryProfile.baseSalary : BigDecimal.ZERO;
            deductions = absentPenalty.add(latePenalty);
            netPay = grossPay.subtract(deductions).max(BigDecimal.ZERO);
        } else {
            grossPay = salaryProfile.baseSalary;
            deductions = absentPenalty.add(latePenalty);
            netPay = grossPay.subtract(deductions).max(BigDecimal.ZERO);
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
                .leaveDays(acc.leaveDays)
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

    private String resolveAttendanceStatusForPayroll(Attendance attendance,
            WorkShiftAssignment assignment,
            LocalDate today,
            LocalTime now) {
        // Check if assignment is marked as ON_LEAVE
        if (assignment != null && "ON_LEAVE".equalsIgnoreCase(assignment.getStatus())) {
            return "ON_LEAVE";
        }

        if (attendance != null) {
            String normalizedStatus = normalizeStatus(attendance.getStatus());
            if ("ON_LEAVE".equals(normalizedStatus)) {
                return "ON_LEAVE";
            }
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

    private String resolveAttendanceStatusForMonitoring(Attendance attendance,
            WorkShiftAssignment assignment,
            LocalDate today,
            LocalTime now) {
        // Check if assignment is marked as ON_LEAVE
        if (assignment != null && "ON_LEAVE".equalsIgnoreCase(assignment.getStatus())) {
            return "ON_LEAVE";
        }

        if (attendance != null) {
            String normalizedStatus = normalizeStatus(attendance.getStatus());
            if ("ON_LEAVE".equals(normalizedStatus)) {
                return "ON_LEAVE";
            }
            if (!"PENDING".equals(normalizedStatus)) {
                return normalizedStatus;
            }

            if (attendance.getTimeIn() != null && attendance.getTimeOut() == null
                    && hasShiftEnded(assignment, today, now)) {
                return "MISSING_CLOCK_OUT";
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

    private String resolveAttendanceStatusForUpsert(String requestedStatus,
            LocalTime timeIn,
            LocalTime timeOut,
            WorkShiftAssignment assignment) {
        if (requestedStatus != null && !requestedStatus.isBlank()) {
            return normalizeStatus(requestedStatus);
        }

        if (timeIn == null) {
            return "PENDING";
        }

        if (timeOut == null) {
            return "PENDING";
        }

        WorkShift shift = assignment != null ? assignment.getWorkShift() : null;
        if (shift == null || shift.getStartTime() == null) {
            return "PRESENT";
        }

        LocalTime graceCutoff = shift.getStartTime().plusMinutes(Optional.ofNullable(shift.getGracePeroidMinutes()).orElse(0));
        if (timeIn.isAfter(graceCutoff)) {
            return "LATE";
        }

        return "PRESENT";
    }

    private void validateAttendanceTimeline(LocalTime timeIn,
            LocalTime timeOut,
            WorkShiftAssignment assignment) {
        if (timeOut != null && timeIn == null) {
            throw new RuntimeException("Không thể rời ca khi chưa chấm công vào ca");
        }

        if (timeIn != null && timeOut != null && timeOut.equals(timeIn)) {
            throw new RuntimeException("Giờ vào ca và rời ca không được trùng nhau");
        }

        if (timeIn == null || timeOut == null || assignment == null || assignment.getWorkShift() == null) {
            return;
        }

        WorkShift shift = assignment.getWorkShift();
        LocalTime shiftStart = shift.getStartTime();
        LocalTime shiftEnd = shift.getEndTime();

        if (shiftStart == null || shiftEnd == null) {
            return;
        }

        boolean overnight = !shiftEnd.isAfter(shiftStart);
        if (!overnight && timeOut.isBefore(timeIn)) {
            throw new RuntimeException("Giờ rời ca không hợp lệ: phải sau giờ vào ca");
        }

        if (!overnight && timeOut.isBefore(shiftEnd)) {
            throw new RuntimeException("Chưa hết ca, chưa thể chấm công ra");
        }

        if (overnight) {
            if (timeOut.isAfter(timeIn)) {
                throw new RuntimeException("Giờ rời ca không hợp lệ cho ca qua đêm");
            }
            if (timeOut.isBefore(shiftEnd)) {
                throw new RuntimeException("Chưa hết ca, chưa thể chấm công ra");
            }
        }
    }

    private boolean hasShiftEnded(WorkShiftAssignment assignment,
            LocalDate today,
            LocalTime now) {
        if (assignment == null || assignment.getShiftDate() == null || assignment.getWorkShift() == null) {
            return false;
        }

        WorkShift shift = assignment.getWorkShift();
        if (shift.getEndTime() == null) {
            return false;
        }

        LocalDateTime shiftEndDateTime = LocalDateTime.of(assignment.getShiftDate(), shift.getEndTime());
        if (shift.getStartTime() != null && !shift.getEndTime().isAfter(shift.getStartTime())) {
            shiftEndDateTime = shiftEndDateTime.plusDays(1);
        }

        LocalDateTime nowDateTime = LocalDateTime.of(today, now);
        return !nowDateTime.isBefore(shiftEndDateTime);
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
        private int leaveDays;
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

    // ===== Email payroll notification =====
    private void sendPayrollEmailToAdmin(String month, PayrollSummaryResponse snapshot, int paidCount, String callerEmail) {
        // adminEmails is optional - callerEmail is the primary recipient
        if (senderEmail == null || senderEmail.isBlank()) {
            log.warn("No sender email configured (MAIL_USERNAME). Skip payroll email.");
            return;
        }

        // Query all active MANAGER users from DB
        List<String> recipients = userRepository.findByRole_NameInAndActiveTrueAndStatusIgnoreCase(
                List.of("MANAGER", "ROLE_MANAGER"), "ACTIVE")
                .stream()
                .map(com.smalltrend.entity.User::getEmail)
                .filter(e -> e != null && !e.isBlank())
                .distinct()
                .collect(Collectors.toList());

        if (recipients.isEmpty()) {
            return;
        }

        String subject = "[SmallTrend] Xác nhận thanh toán lương tháng " + month;
        String htmlContent = buildPayrollDashboardEmailHtml(month, snapshot, paidCount);

        for (String recipient : recipients) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
                helper.setTo(recipient);
                helper.setFrom(senderEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(message);
                log.info("Sent payroll notification email to {} for month {}", recipient, month);
            } catch (Exception e) {
                log.error("Failed to send payroll email to {}: {}", recipient, e.getMessage());
            }
        }
    }

    private String buildPayrollEmailHtml(String month, PayrollSummaryResponse snapshot, int paidCount) {
        StringBuilder rows = new StringBuilder();
        for (PayrollSummaryResponse.Row row : snapshot.getRows()) {
            BigDecimal absPenalty = ABSENT_PENALTY_AMOUNT.multiply(BigDecimal.valueOf(row.getAbsentShifts()));
            BigDecimal latPenalty = LATE_PENALTY_AMOUNT.multiply(BigDecimal.valueOf(row.getLateShifts()));
            rows.append(String.format(
                    "<tr>"
                    + "<td style='padding:8px;border:1px solid #ddd;'>%s</td>"
                    + "<td style='padding:8px;border:1px solid #ddd;text-align:center;'>%d/%d</td>"
                    + "<td style='padding:8px;border:1px solid #ddd;text-align:center;'>%d</td>"
                    + "<td style='padding:8px;border:1px solid #ddd;text-align:center;'>%d</td>"
                    + "<td style='padding:8px;border:1px solid #ddd;text-align:center;'>%d</td>"
                    + "<td style='padding:8px;border:1px solid #ddd;text-align:right;color:#dc2626;'>-%s</td>"
                    + "<td style='padding:8px;border:1px solid #ddd;text-align:right;color:#dc2626;'>-%s</td>"
                    + "<td style='padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;'>%s</td>"
                    + "</tr>",
                    safe(row.getFullName()),
                    row.getWorkedShifts(), row.getTotalShifts(),
                    row.getLateShifts(),
                    row.getAbsentShifts(),
                    row.getLeaveDays() != null ? row.getLeaveDays() : 0,
                    formatVnd(latPenalty),
                    formatVnd(absPenalty),
                    formatVnd(row.getNetPay())
            ));
        }

        return "<div style='font-family:Arial,sans-serif;max-width:900px;margin:auto;'>"
                + "<h2 style='color:#1e293b;'>Xác nhận thanh toán lương tháng " + safe(month) + "</h2>"
                + "<p>Hệ thống đã xác nhận thanh toán lương cho <strong>" + paidCount + "</strong> nhân viên.</p>"
                + "<p>Tổng lương: <strong>" + formatVnd(snapshot.getTotalPayroll()) + "</strong> | "
                + "Tổng giờ công: <strong>" + snapshot.getTotalHours() + "h</strong></p>"
                + "<table style='border-collapse:collapse;width:100%;margin-top:12px;'>"
                + "<thead><tr style='background:#f1f5f9;'>"
                + "<th style='padding:8px;border:1px solid #ddd;text-align:left;'>Nhân viên</th>"
                + "<th style='padding:8px;border:1px solid #ddd;'>Ca làm</th>"
                + "<th style='padding:8px;border:1px solid #ddd;'>Muộn</th>"
                + "<th style='padding:8px;border:1px solid #ddd;'>Vắng</th>"
                + "<th style='padding:8px;border:1px solid #ddd;'>Nghỉ phép</th>"
                + "<th style='padding:8px;border:1px solid #ddd;'>Phạt muộn</th>"
                + "<th style='padding:8px;border:1px solid #ddd;'>Phạt vắng</th>"
                + "<th style='padding:8px;border:1px solid #ddd;'>Thực nhận</th>"
                + "</tr></thead><tbody>"
                + rows
                + "</tbody></table>"
                + "<p style='margin-top:16px;color:#64748b;font-size:13px;'>Đây là email tự động từ hệ thống SmallTrend.</p>"
                + "</div>";
    }

    private String formatVnd(BigDecimal value) {
        if (value == null) {
            return "0";
        }
        return java.text.NumberFormat.getInstance(new java.util.Locale("vi", "VN")).format(value.setScale(0, RoundingMode.HALF_UP)) + "đ";
    }

    private String safe(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private String buildPayrollDashboardEmailHtml(String month, PayrollSummaryResponse snapshot, int paidCount) {
        int totalShifts = 0;
        int workedShifts = 0;
        int lateShifts = 0;
        int absentShifts = 0;
        int leaveDays = 0;
        int flaggedEmployees = 0;
        BigDecimal totalGrossPay = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        StringBuilder rows = new StringBuilder();

        for (PayrollSummaryResponse.Row row : snapshot.getRows()) {
            int rowTotalShifts = defaultInt(row.getTotalShifts());
            int rowWorkedShifts = defaultInt(row.getWorkedShifts());
            int rowLateShifts = defaultInt(row.getLateShifts());
            int rowAbsentShifts = defaultInt(row.getAbsentShifts());
            int rowLeaveDays = defaultInt(row.getLeaveDays());
            BigDecimal rowGrossPay = defaultAmount(row.getGrossPay());
            BigDecimal rowDeductions = defaultAmount(row.getDeductions());
            BigDecimal rowNetPay = defaultAmount(row.getNetPay());

            totalShifts += rowTotalShifts;
            workedShifts += rowWorkedShifts;
            lateShifts += rowLateShifts;
            absentShifts += rowAbsentShifts;
            leaveDays += rowLeaveDays;
            totalGrossPay = totalGrossPay.add(rowGrossPay);
            totalDeductions = totalDeductions.add(rowDeductions);
            if (Boolean.TRUE.equals(row.getAttendanceFlag())) {
                flaggedEmployees += 1;
            }

            rows.append(String.format(
                    "<tr>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;'>%s</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:center;'>%d</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:center;'>%d</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:center;'>%d</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:center;'>%d</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:center;'>%d</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:right;'>%s</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:right;'>%s</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:right;color:#dc2626;'>-%s</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:right;font-weight:700;'>%s</td>"
                    + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:center;'>%s</td>"
                    + "</tr>",
                    safe(row.getFullName()),
                    rowTotalShifts,
                    rowWorkedShifts,
                    rowLateShifts,
                    rowAbsentShifts,
                    rowLeaveDays,
                    formatHours(row.getWorkedHours()),
                    formatVnd(rowGrossPay),
                    formatVnd(rowDeductions),
                    formatVnd(rowNetPay),
                    Boolean.TRUE.equals(row.getAttendanceFlag()) ? "Can xu ly" : "On dinh"
            ));
        }

        return "<div style='font-family:Arial,sans-serif;max-width:980px;margin:auto;color:#0f172a;'>"
                + "<div style='padding:24px;border:1px solid #e2e8f0;border-radius:18px;background:#f8fafc;'>"
                + "<h2 style='margin:0;color:#0f172a;'>Bao cao thanh toan luong thang " + safe(month) + "</h2>"
                + "<p style='margin:10px 0 0;color:#475569;'>He thong da xac nhan thanh toan luong cho <strong>" + paidCount + "</strong> nhan vien. Email nay tong hop day du dashboard cham cong, phan loai ca va bang luong chi tiet cua toan bo nhan su.</p>"
                + "</div>"
                + "<div style='margin-top:16px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;'>"
                + buildSummaryCard("Nhan vien da thanh toan", String.valueOf(paidCount), "#dbeafe", "#1d4ed8")
                + buildSummaryCard("Tong luong thuc nhan", formatVnd(snapshot.getTotalPayroll()), "#dcfce7", "#15803d")
                + buildSummaryCard("Tong gio cong", formatHours(snapshot.getTotalHours()), "#ede9fe", "#6d28d9")
                + buildSummaryCard("Tong ca trong thang", String.valueOf(totalShifts), "#e2e8f0", "#334155")
                + buildSummaryCard("Ca da lam", String.valueOf(workedShifts), "#dcfce7", "#15803d")
                + buildSummaryCard("Nhan vien can luu y", String.valueOf(flaggedEmployees), "#fee2e2", "#b91c1c")
                + "</div>"
                + "<div style='margin-top:18px;padding:18px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;'>"
                + "<h3 style='margin:0 0 12px;color:#0f172a;'>Tong hop dashboard cham cong</h3>"
                + "<table style='border-collapse:collapse;width:100%;'>"
                + "<thead><tr style='background:#f8fafc;'>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Chi so</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>So luong</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Ghi chu</th>"
                + "</tr></thead><tbody>"
                + buildMetricRow("Ca da lam", workedShifts, "Ca co check-in/check-out hop le")
                + buildMetricRow("Di muon", lateShifts, "Phat 50.000d / lan")
                + buildMetricRow("Vang khong phep", absentShifts, "Phat 200.000d / ca")
                + buildMetricRow("Nghi phep", leaveDays, "Tach rieng voi vang")
                + buildMetricRow("Tong khau tru", formatVnd(totalDeductions), "Tong phat va tru luong")
                + buildMetricRow("Tong luong gross", formatVnd(totalGrossPay), "Tong luong truoc khau tru")
                + "</tbody></table>"
                + "</div>"
                + "<div style='margin-top:18px;padding:18px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;'>"
                + "<h3 style='margin:0 0 12px;color:#0f172a;'>Bang luong chi tiet tung nhan vien</h3>"
                + "<table style='border-collapse:collapse;width:100%;margin-top:12px;'>"
                + "<thead><tr style='background:#f1f5f9;'>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;text-align:left;'>Nhan vien</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Tong ca</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Ca da lam</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Muon</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Vang</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Nghi phep</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Gio cong</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Luong gross</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Khau tru</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Thuc nhan</th>"
                + "<th style='padding:10px;border:1px solid #e2e8f0;'>Canh bao</th>"
                + "</tr></thead><tbody>"
                + rows
                + "</tbody></table>"
                + "</div>"
                + "<p style='margin-top:16px;color:#64748b;font-size:13px;'>Day la email tu dong tu he thong SmallTrend. Du lieu da gom bang luong, dashboard cham cong va phan loai ca cua toan bo nhan vien trong thang.</p>"
                + "</div>";
    }

    private String formatHours(BigDecimal value) {
        return defaultAmount(value).setScale(1, RoundingMode.HALF_UP).toPlainString() + "h";
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private BigDecimal defaultAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String buildSummaryCard(String label, String value, String background, String color) {
        return "<div style='padding:14px 16px;border-radius:14px;background:" + background + ";'>"
                + "<div style='font-size:12px;color:#475569;text-transform:uppercase;letter-spacing:.04em;'>" + safe(label) + "</div>"
                + "<div style='margin-top:6px;font-size:24px;font-weight:700;color:" + color + ";'>" + safe(value) + "</div>"
                + "</div>";
    }

    private String buildMetricRow(String label, int value, String note) {
        return buildMetricRow(label, String.valueOf(value), note);
    }

    private String buildMetricRow(String label, String value, String note) {
        return "<tr>"
                + "<td style='padding:10px;border:1px solid #e2e8f0;'>" + safe(label) + "</td>"
                + "<td style='padding:10px;border:1px solid #e2e8f0;text-align:center;font-weight:700;'>" + safe(value) + "</td>"
                + "<td style='padding:10px;border:1px solid #e2e8f0;color:#475569;'>" + safe(note) + "</td>"
                + "</tr>";
    }
}
