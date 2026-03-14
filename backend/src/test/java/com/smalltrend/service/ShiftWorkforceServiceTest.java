package com.smalltrend.service;

import com.smalltrend.dto.shift.AttendanceResponse;
import com.smalltrend.dto.shift.AttendanceUpsertRequest;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
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
    private UserRepository userRepository;

    @Mock
    private PayrollCalculationRepository payrollCalculationRepository;

    @InjectMocks
    private ShiftWorkforceService shiftWorkforceService;

    private User buildUser(Integer id) {
        return User.builder()
                .id(id)
                .username("u" + id)
                .fullName("User " + id)
                .email("u" + id + "@mail.com")
                .salaryType(SalaryType.MONTHLY)
                .baseSalary(new BigDecimal("12000000"))
                .hourlyRate(new BigDecimal("60000"))
                .workingHoursPerMonth(new BigDecimal("208"))
                .countLateAsPresent(true)
                .build();
    }

    // --- Tests for markPayrollAsPaid (Logic Function 1) ---

    @Test
    void markPayrollAsPaid_shouldPersistPaidCalculation_whenHasAssignments() {
        LocalDate periodStart = LocalDate.of(2026, 3, 1);
        LocalDate periodEnd = LocalDate.of(2026, 3, 31);
        User user = buildUser(3);
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(500)
                .user(user)
                .shiftDate(LocalDate.of(2026, 3, 8))
                .build();

        Attendance attendance = Attendance.builder()
                .id(600)
                .user(user)
                .date(LocalDate.of(2026, 3, 8))
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

        String result = shiftWorkforceService.markPayrollAsPaid("2026-03", null);

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
    void markPayrollAsPaid_shouldReturnNoAssignmentMessage_whenNoAssignments() {
        LocalDate periodStart = LocalDate.of(2026, 3, 1);
        LocalDate periodEnd = LocalDate.of(2026, 3, 31);

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(periodStart, periodEnd)).thenReturn(List.of());

        String result = shiftWorkforceService.markPayrollAsPaid("2026-03", null);

        assertTrue(result.contains("Không có dữ liệu phân ca"));
        verify(payrollCalculationRepository, never()).save(any());
    }

    // --- Tests for upsertAttendance (Logic Function 2) ---

    @Test
    void upsertAttendance_shouldFail_whenUserMissing() {
        AttendanceUpsertRequest request = new AttendanceUpsertRequest();
        request.setUserId(999);
        request.setDate(LocalDate.of(2026, 3, 6));

        when(userRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> shiftWorkforceService.upsertAttendance(request));

        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void upsertAttendance_shouldCreateSnapshot_whenAssignmentExists() {
        LocalDate date = LocalDate.of(2026, 3, 6);
        User user = buildUser(21);
        WorkShift shift = WorkShift.builder().id(210).shiftName("Ca snapshot").build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(211).user(user).workShift(shift).shiftDate(date).build();

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
}
