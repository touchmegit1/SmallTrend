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
import com.smalltrend.repository.WorkShiftRepository;
import com.smalltrend.service.shift.ShiftWorkforceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShiftWorkforceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private WorkShiftAssignmentRepository assignmentRepository;

        @Mock
        private WorkShiftRepository workShiftRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PayrollCalculationRepository payrollCalculationRepository;

    @Mock
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    private ShiftWorkforceService shiftWorkforceService;

    @BeforeEach
    void setUp() {
        shiftWorkforceService = new ShiftWorkforceService(
                attendanceRepository,
                assignmentRepository,
                workShiftRepository,
                userRepository,
                payrollCalculationRepository,
                mailSender);
    }

    @Test
    void previewShiftPolicy_shouldReturnViolation_whenClockOutAfterAllowedWindow() {
        LocalDate shiftDate = LocalDate.of(2026, 3, 15);
        WorkShift shift = WorkShift.builder()
                .id(990)
                .shiftName("Policy Preview Shift")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .allowEarlyClockIn(true)
                .earlyClockInMinutes(15)
                .allowLateClockOut(true)
                .lateClockOutMinutes(10)
                .gracePeroidMinutes(5)
                .build();

        when(workShiftRepository.findById(990)).thenReturn(Optional.of(shift));

        var preview = shiftWorkforceService.previewShiftPolicy(
                990,
                shiftDate,
                LocalTime.of(8, 3),
                LocalTime.of(17, 30));

        assertTrue(preview.getViolationCodes().contains("LATE_CLOCK_OUT_OUT_OF_WINDOW"));
        assertEquals(false, preview.getCanCheckOut());
    }

    @Test
    void listAttendance_shouldMarkAbsent_whenPastShiftHasNoCheckin() {
        LocalDate shiftDate = LocalDate.now().minusDays(1);
        User user = buildUser(1, "Tester User");
        WorkShift shift = WorkShift.builder()
                .id(11)
                .shiftName("Ca sáng")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .workingMinutes(480)
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(100)
                .user(user)
                .workShift(shift)
                .shiftDate(shiftDate)
                .notes("Kiểm tra")
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(shiftDate, shiftDate))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.findByDateBetween(shiftDate, shiftDate)).thenReturn(List.of());

        List<AttendanceResponse> rows = shiftWorkforceService.listAttendance(
                shiftDate,
                shiftDate,
                shiftDate,
                null,
                "ALL");

        assertEquals(1, rows.size());
        assertEquals("ABSENT", rows.get(0).getStatus());
    }

    @Test
    void listAttendance_shouldThrow_whenDateRangeInvalid() {
        LocalDate start = LocalDate.of(2026, 3, 10);
        LocalDate end = LocalDate.of(2026, 3, 1);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> shiftWorkforceService.listAttendance(null, start, end, null, "ALL"));

        assertEquals("Start date must be before or equal to end date", ex.getMessage());
    }

    @Test
    void listAttendance_shouldFilterByStatus() {
        LocalDate shiftDate = LocalDate.now().minusDays(1);
        User user = buildUser(9, "Filter User");
        WorkShift shift = WorkShift.builder().id(19).shiftName("Ca test").startTime(LocalTime.of(8, 0)).endTime(LocalTime.of(17, 0)).build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder().id(900).user(user).workShift(shift).shiftDate(shiftDate).build();
        Attendance attendance = Attendance.builder().id(901).user(user).date(shiftDate).status("PRESENT").build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(shiftDate, shiftDate)).thenReturn(List.of(assignment));
        when(attendanceRepository.findByDateBetween(shiftDate, shiftDate)).thenReturn(List.of(attendance));

        List<AttendanceResponse> rows = shiftWorkforceService.listAttendance(shiftDate, shiftDate, shiftDate, null, "ABSENT");

        assertEquals(0, rows.size());
    }

    @Test
    void buildPayrollSummary_shouldExcludePaidMonthRows() {
        LocalDate start = LocalDate.of(2026, 3, 1);
        LocalDate end = LocalDate.of(2026, 3, 31);

        User user = buildUser(2, "Paid User");
        WorkShift shift = WorkShift.builder()
                .id(12)
                .shiftName("Ca chiều")
                .startTime(LocalTime.of(13, 0))
                .endTime(LocalTime.of(22, 0))
                .workingMinutes(480)
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(200)
                .user(user)
                .workShift(shift)
                .shiftDate(LocalDate.of(2026, 3, 12))
                .build();

        Attendance attendance = Attendance.builder()
                .id(300)
                .user(user)
                .date(LocalDate.of(2026, 3, 12))
                .timeIn(LocalTime.of(13, 0))
                .timeOut(LocalTime.of(22, 0))
                .status("PRESENT")
                .build();

        PayrollCalculation paid = PayrollCalculation.builder()
                .id(400)
                .user(user)
                .status("PAID")
                .payPeriodStart(start)
                .payPeriodEnd(end)
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(start, end)).thenReturn(List.of(assignment));
        when(attendanceRepository.findByDateBetween(start, end)).thenReturn(List.of(attendance));
        when(payrollCalculationRepository.findByPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(start, end))
                .thenReturn(List.of(paid));

        PayrollSummaryResponse response = shiftWorkforceService.buildPayrollSummary("2026-03", null, null, null, null);

        assertEquals("2026-03", response.getMonth());
        assertEquals(0, response.getStaffCount());
        assertEquals(new BigDecimal("0.00"), response.getTotalPayroll());
    }

    @Test
    void buildPayrollSummary_shouldThrow_whenMonthRangeInvalid() {
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> shiftWorkforceService.buildPayrollSummary(null, "2026-04", "2026-03", null, null));
        assertEquals("fromMonth must be before or equal to toMonth", ex.getMessage());
    }

    @Test
    void markPayrollAsPaid_shouldPersistPaidCalculation() {
        LocalDate periodStart = LocalDate.of(2026, 3, 1);
        LocalDate periodEnd = LocalDate.of(2026, 3, 31);
        LocalDate shiftDate = LocalDate.of(2026, 3, 8);

        User user = buildUser(3, "Payroll User");
        WorkShift shift = WorkShift.builder()
                .id(13)
                .shiftName("Ca tối")
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(22, 0))
                .workingMinutes(480)
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(500)
                .user(user)
                .workShift(shift)
                .shiftDate(shiftDate)
                .build();

        Attendance attendance = Attendance.builder()
                .id(600)
                .user(user)
                .date(shiftDate)
                .timeIn(LocalTime.of(14, 0))
                .timeOut(LocalTime.of(22, 0))
                .status("PRESENT")
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(periodStart, periodEnd))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.findByDateBetween(periodStart, periodEnd)).thenReturn(List.of(attendance));
        when(payrollCalculationRepository.findByPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(periodStart, periodEnd))
                .thenReturn(List.of());
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(payrollCalculationRepository.findByUserIdAndPayPeriodStartAndPayPeriodEnd(user.getId(), periodStart, periodEnd))
                .thenReturn(Optional.empty());

        String result = shiftWorkforceService.markPayrollAsPaid("2026-03", null, null);

        assertTrue(result.contains("1 nhân viên"));

        ArgumentCaptor<PayrollCalculation> captor = ArgumentCaptor.forClass(PayrollCalculation.class);
        verify(payrollCalculationRepository).save(captor.capture());
        PayrollCalculation saved = captor.getValue();
        assertEquals("PAID", saved.getStatus());
        assertEquals(user.getId(), saved.getUser().getId());
        assertEquals(periodStart, saved.getPayPeriodStart());
        assertEquals(periodEnd, saved.getPayPeriodEnd());
    }

    @Test
    void markPayrollAsPaid_shouldReturnNoAssignmentMessage() {
        LocalDate periodStart = LocalDate.of(2026, 3, 1);
        LocalDate periodEnd = LocalDate.of(2026, 3, 31);

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(periodStart, periodEnd)).thenReturn(List.of());

        String result = shiftWorkforceService.markPayrollAsPaid("2026-03", null, null);

        assertTrue(result.contains("Không có dữ liệu phân ca"));
        verify(payrollCalculationRepository, never()).save(any());
    }

    @Test
    void buildPayrollPaymentStatus_shouldReturnUnsupported_whenRangeIsMultiMonth() {
        Map<String, Object> result = shiftWorkforceService.buildPayrollPaymentStatus(null, "2026-03", "2026-04", null, null);

        assertEquals(false, result.get("supported"));
        assertTrue(String.valueOf(result.get("month")).contains("~"));
    }

    @Test
    void buildPayrollPaymentStatus_shouldReturnPaid_whenAllAssignedUsersPaid() {
        LocalDate periodStart = LocalDate.of(2026, 3, 1);
        LocalDate periodEnd = LocalDate.of(2026, 3, 31);
        User user = buildUser(20, "Payment User");

        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(2000)
                .user(user)
                .shiftDate(LocalDate.of(2026, 3, 15))
                .build();

        PayrollCalculation paid = PayrollCalculation.builder()
                .id(2001)
                .user(user)
                .status("PAID")
                .payPeriodStart(periodStart)
                .payPeriodEnd(periodEnd)
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(periodStart, periodEnd)).thenReturn(List.of(assignment));
        when(payrollCalculationRepository.findByPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(periodStart, periodEnd))
                .thenReturn(List.of(paid));

        Map<String, Object> result = shiftWorkforceService.buildPayrollPaymentStatus("2026-03", null, null, LocalDate.now().plusDays(2), null);

        assertEquals(true, result.get("isPaid"));
        assertEquals(1, result.get("assignedStaff"));
        assertEquals(1, result.get("paidStaff"));
        assertEquals(0, result.get("remainingStaff"));
    }

    @Test
    void upsertAttendance_shouldFail_whenUserMissing() {
        AttendanceUpsertRequest request = new AttendanceUpsertRequest();
        request.setUserId(999);
        request.setDate(LocalDate.of(2026, 3, 6));

        when(userRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> shiftWorkforceService.upsertAttendance(request));

        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void upsertAttendance_shouldCreateSnapshot_whenAssignmentExists() {
        LocalDate date = LocalDate.of(2026, 3, 6);
        User user = buildUser(21, "Snapshot User");
        WorkShift shift = WorkShift.builder()
                .id(210)
                .shiftName("Ca snapshot")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .workingMinutes(480)
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(211)
                .user(user)
                .workShift(shift)
                .shiftDate(date)
                .notes("snapshot")
                .build();

        AttendanceUpsertRequest request = new AttendanceUpsertRequest();
        request.setUserId(21);
        request.setDate(date);
        request.setStatus("present");
        request.setTimeIn(LocalTime.of(8, 5));
        request.setTimeOut(LocalTime.of(17, 0));

        when(userRepository.findById(21)).thenReturn(Optional.of(user));
        when(attendanceRepository.findByUserIdAndDate(21, date)).thenReturn(Optional.empty());
        when(assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(21, date, date))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> {
            Attendance a = invocation.getArgument(0);
            a.setId(999);
            return a;
        });

        AttendanceResponse response = shiftWorkforceService.upsertAttendance(request);

        assertEquals("PRESENT", response.getStatus());
        assertEquals(21, response.getUserId());
        assertEquals(210, response.getShiftId());
        assertEquals("Ca snapshot", response.getShiftName());
    }

    @Test
    void listAttendance_shouldMarkMissingClockOut_whenShiftEndedAndNoTimeOut() {
        LocalDate shiftDate = LocalDate.now().minusDays(1);
        User user = buildUser(30, "Missing ClockOut User");
        WorkShift shift = WorkShift.builder()
                .id(301)
                .shiftName("Ca hành chính")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(302)
                .user(user)
                .workShift(shift)
                .shiftDate(shiftDate)
                .build();
        Attendance attendance = Attendance.builder()
                .id(303)
                .user(user)
                .date(shiftDate)
                .timeIn(LocalTime.of(8, 10))
                .timeOut(null)
                .status("PENDING")
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(shiftDate, shiftDate))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.findByDateBetween(shiftDate, shiftDate)).thenReturn(List.of(attendance));

        List<AttendanceResponse> rows = shiftWorkforceService.listAttendance(
                shiftDate,
                shiftDate,
                shiftDate,
                null,
                "ALL");

        assertEquals(1, rows.size());
        assertEquals("MISSING_CLOCK_OUT", rows.get(0).getStatus());
    }

    @Test
    void upsertAttendance_shouldThrow_whenTimeOutWithoutTimeIn() {
        LocalDate date = LocalDate.of(2026, 3, 10);
        User user = buildUser(31, "Clockout Without Checkin");

        AttendanceUpsertRequest request = AttendanceUpsertRequest.builder()
                .userId(31)
                .date(date)
                .timeOut(LocalTime.of(17, 0))
                .build();

        when(userRepository.findById(31)).thenReturn(Optional.of(user));
        when(attendanceRepository.findByUserIdAndDate(31, date)).thenReturn(Optional.empty());
        when(assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(31, date, date))
                .thenReturn(List.of());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> shiftWorkforceService.upsertAttendance(request));

        assertEquals("Không thể rời ca khi chưa chấm công vào ca", ex.getMessage());
    }

    @Test
    void upsertAttendance_shouldThrow_whenClockInEarlierThanAllowedWindow() {
        LocalDate date = LocalDate.of(2026, 3, 12);
        User user = buildUser(34, "Too Early ClockIn User");
        WorkShift shift = WorkShift.builder()
                .id(340)
                .shiftName("Ca tiêu chuẩn")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .allowEarlyClockIn(false)
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(341)
                .user(user)
                .workShift(shift)
                .shiftDate(date)
                .build();

        AttendanceUpsertRequest request = AttendanceUpsertRequest.builder()
                .userId(34)
                .date(date)
                .timeIn(LocalTime.of(7, 30))
                .timeOut(LocalTime.of(17, 0))
                .build();

        when(userRepository.findById(34)).thenReturn(Optional.of(user));
        when(attendanceRepository.findByUserIdAndDate(34, date)).thenReturn(Optional.empty());
        when(assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(34, date, date))
                .thenReturn(List.of(assignment));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> shiftWorkforceService.upsertAttendance(request));

        assertEquals("Giờ vào ca sớm hơn mức cho phép của ca", ex.getMessage());
    }

    @Test
    void upsertAttendance_shouldThrow_whenClockOutLaterThanAllowedWindow() {
        LocalDate date = LocalDate.of(2026, 3, 13);
        User user = buildUser(35, "Too Late ClockOut User");
        WorkShift shift = WorkShift.builder()
                .id(350)
                .shiftName("Ca giới hạn giờ ra")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .allowLateClockOut(true)
                .lateClockOutMinutes(15)
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(351)
                .user(user)
                .workShift(shift)
                .shiftDate(date)
                .build();

        AttendanceUpsertRequest request = AttendanceUpsertRequest.builder()
                .userId(35)
                .date(date)
                .timeIn(LocalTime.of(8, 0))
                .timeOut(LocalTime.of(17, 30))
                .build();

        when(userRepository.findById(35)).thenReturn(Optional.of(user));
        when(attendanceRepository.findByUserIdAndDate(35, date)).thenReturn(Optional.empty());
        when(assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(35, date, date))
                .thenReturn(List.of(assignment));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> shiftWorkforceService.upsertAttendance(request));

        assertEquals("Giờ rời ca muộn hơn mức cho phép của ca", ex.getMessage());
    }

    @Test
    void upsertAttendance_shouldMarkLate_forOvernightShiftAfterMidnightCheckIn() {
        LocalDate date = LocalDate.of(2026, 3, 14);
        User user = buildUser(36, "Overnight Late User");
        WorkShift shift = WorkShift.builder()
                .id(360)
                .shiftName("Ca đêm")
                .startTime(LocalTime.of(22, 0))
                .endTime(LocalTime.of(6, 0))
                .gracePeroidMinutes(10)
                .allowLateClockOut(true)
                .lateClockOutMinutes(60)
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(361)
                .user(user)
                .workShift(shift)
                .shiftDate(date)
                .build();

        AttendanceUpsertRequest request = AttendanceUpsertRequest.builder()
                .userId(36)
                .date(date)
                .timeIn(LocalTime.of(0, 20))
                .timeOut(LocalTime.of(6, 0))
                .build();

        when(userRepository.findById(36)).thenReturn(Optional.of(user));
        when(attendanceRepository.findByUserIdAndDate(36, date)).thenReturn(Optional.empty());
        when(assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(36, date, date))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(assignmentRepository.save(any(WorkShiftAssignment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AttendanceResponse response = shiftWorkforceService.upsertAttendance(request);

        assertEquals("LATE", response.getStatus());
    }

    @Test
    void clockOut_shouldThrow_whenShiftNotEnded() {
        LocalDate shiftDate = LocalDate.now().plusDays(1);
        User user = buildUser(32, "Future Shift User");
        WorkShift shift = WorkShift.builder()
                .id(320)
                .shiftName("Ca tương lai")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(321)
                .user(user)
                .workShift(shift)
                .shiftDate(shiftDate)
                .build();

        AttendanceUpsertRequest request = AttendanceUpsertRequest.builder()
                .userId(32)
                .date(shiftDate)
                .timeOut(LocalTime.of(17, 0))
                .build();

        when(assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(32, shiftDate, shiftDate))
                .thenReturn(List.of(assignment));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> shiftWorkforceService.clockOut(request));

        assertEquals("Chưa hết ca, chưa thể chấm công ra", ex.getMessage());
    }

    @Test
    void clockOut_shouldComplete_whenShiftEnded() {
        LocalDate shiftDate = LocalDate.now().minusDays(1);
        User user = buildUser(33, "Ended Shift User");
        WorkShift shift = WorkShift.builder()
                .id(330)
                .shiftName("Ca đã kết thúc")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .allowLateClockOut(true)
                .lateClockOutMinutes(30)
                .build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(331)
                .user(user)
                .workShift(shift)
                .shiftDate(shiftDate)
                .status("ASSIGNED")
                .build();
        Attendance existing = Attendance.builder()
                .id(332)
                .user(user)
                .date(shiftDate)
                .timeIn(LocalTime.of(8, 5))
                .timeOut(null)
                .status("PENDING")
                .build();

        AttendanceUpsertRequest request = AttendanceUpsertRequest.builder()
                .userId(33)
                .date(shiftDate)
                .timeOut(LocalTime.of(17, 10))
                .build();

        when(assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(33, shiftDate, shiftDate))
                .thenReturn(List.of(assignment));
        when(userRepository.findById(33)).thenReturn(Optional.of(user));
        when(attendanceRepository.findByUserIdAndDate(33, shiftDate)).thenReturn(Optional.of(existing));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(assignmentRepository.save(any(WorkShiftAssignment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AttendanceResponse response = shiftWorkforceService.clockOut(request);

        assertEquals("PRESENT", response.getStatus());
        assertEquals(LocalTime.of(17, 10), response.getTimeOut());
        verify(assignmentRepository).save(any(WorkShiftAssignment.class));
    }

    private User buildUser(Integer id, String fullName) {
        return User.builder()
                .id(id)
                .username("u" + id)
                .fullName(fullName)
                .email("u" + id + "@mail.com")
                .salaryType(SalaryType.MONTHLY)
                .baseSalary(new BigDecimal("12000000"))
                .hourlyRate(new BigDecimal("60000"))
                .workingHoursPerMonth(new BigDecimal("208"))
                .countLateAsPresent(true)
                .build();
    }
}
