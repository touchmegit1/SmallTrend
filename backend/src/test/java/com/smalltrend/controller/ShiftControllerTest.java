package com.smalltrend.controller;

import com.smalltrend.controller.shift.ShiftController;
import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.shift.AttendanceResponse;
import com.smalltrend.dto.shift.AttendanceUpsertRequest;
import com.smalltrend.dto.shift.PayrollSummaryResponse;
import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.ShiftAssignmentResponse;
import com.smalltrend.dto.shift.ShiftSwapExecuteRequest;
import com.smalltrend.dto.shift.WorkShiftRequest;
import com.smalltrend.dto.shift.WorkShiftResponse;
import com.smalltrend.service.shift.ShiftWorkforceService;
import com.smalltrend.service.shift.WorkShiftAssignmentService;
import com.smalltrend.service.shift.WorkShiftService;
import com.smalltrend.validation.ShiftValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShiftControllerTest {

    @Mock
    private WorkShiftService workShiftService;

    @Mock
    private WorkShiftAssignmentService assignmentService;

    @Mock
    private ShiftWorkforceService workforceService;

    @Mock
    private ShiftValidator validator;

    private ShiftController shiftController;

    @BeforeEach
    void setUp() {
        shiftController = new ShiftController(workShiftService, assignmentService, workforceService, validator);
    }

    @Test
    void createShift_shouldReturnBadRequest_whenValidationFails() {
        WorkShiftRequest request = new WorkShiftRequest();
        when(validator.validateShift(request)).thenReturn(List.of("invalid shift"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("invalid shift");

        ResponseEntity<?> response = shiftController.createShift(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("invalid shift", body.getMessage());
    }

    @Test
    void createShift_shouldReturnOk_whenValidationPasses() {
        WorkShiftRequest request = WorkShiftRequest.builder().shiftCode("MORNING").shiftName("Ca sáng").build();
        WorkShiftResponse expected = WorkShiftResponse.builder().id(10).shiftCode("MORNING").build();

        when(validator.validateShift(request)).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);
        when(workShiftService.createShift(request)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.createShift(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void listShifts_shouldReturnOk() {
        List<WorkShiftResponse> expected = List.of(WorkShiftResponse.builder().id(1).shiftCode("SHIFT-A").build());
        when(workShiftService.listShifts("ca", "ACTIVE", false)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.listShifts("ca", "ACTIVE", false);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void getShift_shouldReturnBadRequest_whenIdInvalid() {
        when(validator.validateId(0, "Shift id")).thenReturn(List.of("Shift id is invalid"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("Shift id is invalid");

        ResponseEntity<?> response = shiftController.getShift(0);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("Shift id is invalid", body.getMessage());
        verify(workShiftService, never()).getShift(any());
    }

    @Test
    void getShift_shouldReturnOk_whenValid() {
        WorkShiftResponse expected = WorkShiftResponse.builder().id(5).shiftCode("SHIFT-5").build();
        when(validator.validateId(5, "Shift id")).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);
        when(workShiftService.getShift(5)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.getShift(5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void updateShift_shouldReturnBadRequest_whenValidationFails() {
        WorkShiftRequest request = WorkShiftRequest.builder().shiftCode("A").build();
        when(validator.validateId(0, "Shift id")).thenReturn(new ArrayList<>(List.of("bad id")));
        when(validator.validateShift(request)).thenReturn(List.of("bad shift"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("bad id; bad shift");

        ResponseEntity<?> response = shiftController.updateShift(0, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("bad id; bad shift", body.getMessage());
        verify(workShiftService, never()).updateShift(any(), any());
    }

    @Test
    void updateShift_shouldReturnOk_whenValid() {
        WorkShiftRequest request = WorkShiftRequest.builder().shiftCode("SHIFT-U").shiftName("Ca cập nhật").build();
        WorkShiftResponse expected = WorkShiftResponse.builder().id(7).shiftCode("SHIFT-U").build();
        when(validator.validateId(7, "Shift id")).thenReturn(new ArrayList<>());
        when(validator.validateShift(request)).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);
        when(workShiftService.updateShift(7, request)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.updateShift(7, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void deleteShift_shouldReturnBadRequest_whenIdInvalid() {
        when(validator.validateId(-1, "Shift id")).thenReturn(List.of("bad id"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("bad id");

        ResponseEntity<?> response = shiftController.deleteShift(-1);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("bad id", body.getMessage());
        verify(workShiftService, never()).deleteShift(any());
    }

    @Test
    void deleteShift_shouldReturnOk_whenValid() {
        when(validator.validateId(8, "Shift id")).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);

        ResponseEntity<?> response = shiftController.deleteShift(8);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("Shift deleted", body.getMessage());
        verify(workShiftService).deleteShift(8);
    }

    @Test
    void createAssignment_shouldReturnBadRequest_whenValidationFails() {
        ShiftAssignmentRequest request = ShiftAssignmentRequest.builder().workShiftId(1).userId(2).build();
        when(validator.validateAssignment(request)).thenReturn(List.of("invalid assignment"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("invalid assignment");

        ResponseEntity<?> response = shiftController.createAssignment(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("invalid assignment", body.getMessage());
        verify(assignmentService, never()).createAssignment(any());
    }

    @Test
    void createAssignment_shouldReturnOk_whenValid() {
        ShiftAssignmentRequest request = ShiftAssignmentRequest.builder()
                .workShiftId(1)
                .userId(2)
                .shiftDate(LocalDate.of(2026, 3, 6))
                .build();
        ShiftAssignmentResponse expected = ShiftAssignmentResponse.builder().id(11).build();

        when(validator.validateAssignment(request)).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);
        when(assignmentService.createAssignment(request)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.createAssignment(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void listAssignments_shouldReturnBadRequest_whenDateRangeInvalid() {
        LocalDate start = LocalDate.of(2026, 3, 10);
        LocalDate end = LocalDate.of(2026, 3, 1);

        when(validator.validateDateRange(start, end)).thenReturn(List.of("End date must be after start date"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("End date must be after start date");

        ResponseEntity<?> response = shiftController.listAssignments(start, end, null, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("End date must be after start date", body.getMessage());
        verify(assignmentService, never()).listAssignments(any(), any(), any(), any());
    }

    @Test
    void listAssignments_shouldReturnOk_whenValid() {
        LocalDate start = LocalDate.of(2026, 3, 1);
        LocalDate end = LocalDate.of(2026, 3, 31);
        List<ShiftAssignmentResponse> expected = List.of(ShiftAssignmentResponse.builder().id(22).build());
        when(validator.validateDateRange(start, end)).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);
        when(assignmentService.listAssignments(start, end, 2, 3)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.listAssignments(start, end, 2, 3);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void getAssignment_shouldReturnBadRequest_whenIdInvalid() {
        when(validator.validateId(0, "Assignment id")).thenReturn(List.of("bad assignment id"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("bad assignment id");

        ResponseEntity<?> response = shiftController.getAssignment(0);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("bad assignment id", body.getMessage());
        verify(assignmentService, never()).getAssignment(any());
    }

    @Test
    void getAssignment_shouldReturnOk_whenValid() {
        ShiftAssignmentResponse expected = ShiftAssignmentResponse.builder().id(23).build();
        when(validator.validateId(23, "Assignment id")).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);
        when(assignmentService.getAssignment(23)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.getAssignment(23);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void updateAssignment_shouldReturnBadRequest_whenValidationFails() {
        ShiftAssignmentRequest request = ShiftAssignmentRequest.builder().userId(5).build();
        when(validator.validateId(0, "Assignment id")).thenReturn(new ArrayList<>(List.of("bad id")));
        when(validator.validateAssignment(request)).thenReturn(List.of("bad assignment"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("bad id; bad assignment");

        ResponseEntity<?> response = shiftController.updateAssignment(0, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("bad id; bad assignment", body.getMessage());
        verify(assignmentService, never()).updateAssignment(any(), any());
    }

    @Test
    void updateAssignment_shouldReturnOk_whenValid() {
        ShiftAssignmentRequest request = ShiftAssignmentRequest.builder()
                .workShiftId(1)
                .userId(2)
                .shiftDate(LocalDate.of(2026, 3, 10))
                .build();
        ShiftAssignmentResponse expected = ShiftAssignmentResponse.builder().id(24).build();

        when(validator.validateId(24, "Assignment id")).thenReturn(new ArrayList<>());
        when(validator.validateAssignment(request)).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);
        when(assignmentService.updateAssignment(24, request)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.updateAssignment(24, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void deleteAssignment_shouldReturnBadRequest_whenIdInvalid() {
        when(validator.validateId(-2, "Assignment id")).thenReturn(List.of("bad assignment id"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("bad assignment id");

        ResponseEntity<?> response = shiftController.deleteAssignment(-2);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("bad assignment id", body.getMessage());
        verify(assignmentService, never()).deleteAssignment(any());
    }

    @Test
    void deleteAssignment_shouldReturnOk_whenValid() {
        when(validator.validateId(25, "Assignment id")).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);

        ResponseEntity<?> response = shiftController.deleteAssignment(25);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("Assignment deleted", body.getMessage());
        verify(assignmentService).deleteAssignment(25);
    }

    @Test
    void executeSwap_shouldReturnMessageResponse() {
        ShiftSwapExecuteRequest request = ShiftSwapExecuteRequest.builder()
                .requesterAssignmentId(1)
                .targetAssignmentId(2)
                .accepterUserId(3)
                .note("swap")
                .build();
        when(assignmentService.executeSwap(request)).thenReturn("Swap executed");

        ResponseEntity<?> response = shiftController.executeSwap(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("Swap executed", body.getMessage());
    }

    @Test
    void listAttendance_shouldReturnOk() {
        LocalDate date = LocalDate.of(2026, 3, 6);
        List<AttendanceResponse> expected = List.of(AttendanceResponse.builder().id(1).status("PRESENT").build());
        when(workforceService.listAttendance(date, date, date, 2, "ALL")).thenReturn(expected);

        ResponseEntity<?> response = shiftController.listAttendance(date, date, date, 2, "ALL");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void upsertAttendance_shouldReturnOk() {
        AttendanceUpsertRequest request = AttendanceUpsertRequest.builder()
                .userId(3)
                .date(LocalDate.of(2026, 3, 6))
                .timeIn(LocalTime.of(8, 0))
                .status("PRESENT")
                .build();
        AttendanceResponse expected = AttendanceResponse.builder().id(99).status("PRESENT").build();
        when(workforceService.upsertAttendance(request)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.upsertAttendance(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void payrollSummary_shouldDelegateToWorkforceService() {
        PayrollSummaryResponse expected = PayrollSummaryResponse.builder()
                .month("2026-03")
                .staffCount(2)
                .totalHours(new BigDecimal("320.00"))
                .totalPayroll(new BigDecimal("25000000"))
                .build();

        when(workforceService.buildPayrollSummary("2026-03", "2026-03", "2026-03", null, null)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.payrollSummary("2026-03", "2026-03", "2026-03", null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(workforceService).buildPayrollSummary("2026-03", "2026-03", "2026-03", null, null);
    }

    @Test
    void markPayrollAsPaid_shouldReturnMessageResponse() {
        when(workforceService.markPayrollAsPaid("2026-03", null)).thenReturn("Đã xác nhận thanh toán lương tháng 2026-03 cho 3 nhân viên");

        ResponseEntity<?> response = shiftController.markPayrollAsPaid("2026-03", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("Đã xác nhận thanh toán lương tháng 2026-03 cho 3 nhân viên", body.getMessage());
    }

    @Test
    void workforceDashboard_shouldFallbackToMonthData_whenDailyAttendanceEmpty() {
        LocalDate targetDate = LocalDate.of(2026, 3, 6);
        LocalDate dueDate = LocalDate.of(2026, 4, 5);

        when(workforceService.listAttendance(targetDate, targetDate, targetDate, null, "ALL"))
                .thenReturn(List.of());
        when(workforceService.listAttendance(
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 3, 31),
                null,
                "ALL"))
                .thenReturn(List.of(
                        AttendanceResponse.builder().status("PRESENT").build(),
                        AttendanceResponse.builder().status("LATE").build(),
                        AttendanceResponse.builder().status("ABSENT").build()
                ));

        when(workforceService.buildPayrollSummary(null, "2026-03", "2026-03", null, null))
                .thenReturn(PayrollSummaryResponse.builder()
                        .month("2026-03")
                        .staffCount(3)
                        .totalHours(new BigDecimal("24"))
                        .totalPayroll(new BigDecimal("1800000"))
                        .build());

        when(workforceService.buildPayrollPaymentStatus(null, "2026-03", "2026-03", dueDate, null))
                .thenReturn(Map.of("isPaid", false, "month", "2026-03"));

        ResponseEntity<?> response = shiftController.workforceDashboard(
                targetDate,
                null,
                null,
                "2026-03",
                "2026-03",
                dueDate);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();

        @SuppressWarnings("unchecked")
        Map<String, Object> attendance = (Map<String, Object>) body.get("attendance");

        assertEquals(3, attendance.get("total"));
        assertEquals(1, attendance.get("present"));
        assertEquals(1, attendance.get("late"));
        assertEquals(1, attendance.get("absent"));

        @SuppressWarnings("unchecked")
        Map<String, Object> paymentStatus = (Map<String, Object>) body.get("paymentStatus");
        assertTrue(paymentStatus.containsKey("isPaid"));

        verify(workforceService).listAttendance(
                eq(LocalDate.of(2026, 3, 1)),
                eq(LocalDate.of(2026, 3, 1)),
                eq(LocalDate.of(2026, 3, 31)),
                eq(null),
                eq("ALL"));
    }

    @Test
    void workforceDashboard_shouldUseDailyData_whenAvailable() {
        LocalDate targetDate = LocalDate.of(2026, 3, 6);
        LocalDate dueDate = LocalDate.of(2026, 4, 5);

        when(workforceService.listAttendance(targetDate, targetDate, targetDate, 3, "ALL"))
                .thenReturn(List.of(
                        AttendanceResponse.builder().status("PRESENT").build(),
                        AttendanceResponse.builder().status("PRESENT").build(),
                        AttendanceResponse.builder().status("LATE").build()
                ));

        when(workforceService.buildPayrollSummary("2026-03", null, null, 3, null))
                .thenReturn(PayrollSummaryResponse.builder()
                        .month("2026-03")
                        .staffCount(1)
                        .totalHours(new BigDecimal("8"))
                        .totalPayroll(new BigDecimal("600000"))
                        .build());

        when(workforceService.buildPayrollPaymentStatus("2026-03", null, null, dueDate, 3))
                .thenReturn(Map.of("isPaid", true, "month", "2026-03"));

        ResponseEntity<?> response = shiftController.workforceDashboard(
                targetDate,
                3,
                "2026-03",
                null,
                null,
                dueDate);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);

        @SuppressWarnings("unchecked")
        Map<String, Object> attendance = (Map<String, Object>) body.get("attendance");
        assertEquals(3, attendance.get("total"));
        assertEquals(2, attendance.get("present"));
        assertEquals(1, attendance.get("late"));
        assertEquals(0, attendance.get("absent"));

        verify(workforceService, never()).listAttendance(
                eq(LocalDate.of(2026, 3, 1)),
                eq(LocalDate.of(2026, 3, 1)),
                eq(LocalDate.of(2026, 3, 31)),
                eq(3),
                eq("ALL"));

        @SuppressWarnings("unchecked")
        Map<String, Object> paymentStatus = (Map<String, Object>) body.get("paymentStatus");
        assertFalse(paymentStatus.isEmpty());
    }
}
