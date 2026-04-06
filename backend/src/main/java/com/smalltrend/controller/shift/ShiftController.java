package com.smalltrend.controller.shift;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.shift.AttendanceResponse;
import com.smalltrend.dto.shift.AttendanceUpsertRequest;
import com.smalltrend.dto.shift.PayrollSummaryResponse;
import com.smalltrend.dto.shift.ShiftSwapExecuteRequest;
import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.ShiftAssignmentResponse;
import com.smalltrend.dto.shift.WorkShiftRequest;
import com.smalltrend.dto.shift.WorkShiftResponse;
import com.smalltrend.service.shift.ShiftWorkforceService;
import com.smalltrend.service.shift.WorkShiftAssignmentService;
import com.smalltrend.service.shift.WorkShiftService;
import com.smalltrend.validation.ShiftValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.math.BigDecimal;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final WorkShiftService workShiftService;
    private final WorkShiftAssignmentService assignmentService;
    private final ShiftWorkforceService workforceService;
    private final ShiftValidator validator;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> createShift(@Valid @RequestBody WorkShiftRequest request) {
        List<String> errors = validator.validateShift(request);
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }

        WorkShiftResponse response = workShiftService.createShift(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> listShifts(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "includeExpired", required = false, defaultValue = "false") boolean includeExpired) {
        List<WorkShiftResponse> shifts = workShiftService.listShifts(query, status, includeExpired);
        return ResponseEntity.ok(shifts);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> getShift(@PathVariable("id") Integer id) {
        List<String> errors = validator.validateId(id, "Shift id");
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }
        WorkShiftResponse response = workShiftService.getShift(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> updateShift(@PathVariable("id") Integer id, @Valid @RequestBody WorkShiftRequest request) {
        List<String> errors = validator.validateId(id, "Shift id");
        errors.addAll(validator.validateShift(request));
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }

        WorkShiftResponse response = workShiftService.updateShift(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> deleteShift(@PathVariable("id") Integer id) {
        List<String> errors = validator.validateId(id, "Shift id");
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }
        workShiftService.deleteShift(id);
        return ResponseEntity.ok(new MessageResponse("Shift deleted"));
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> createAssignment(@Valid @RequestBody ShiftAssignmentRequest request) {
        List<String> errors = validator.validateAssignment(request);
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }
        ShiftAssignmentResponse response = assignmentService.createAssignment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> listAssignments(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "shiftId", required = false) Integer shiftId) {
        List<String> errors = validator.validateDateRange(startDate, endDate);
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }
        List<ShiftAssignmentResponse> responses = assignmentService.listAssignments(startDate, endDate, userId,
                shiftId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/assignments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> getAssignment(@PathVariable("id") Integer id) {
        List<String> errors = validator.validateId(id, "Assignment id");
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }
        ShiftAssignmentResponse response = assignmentService.getAssignment(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/assignments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> updateAssignment(
            @PathVariable("id") Integer id,
            @Valid @RequestBody ShiftAssignmentRequest request) {
        List<String> errors = validator.validateId(id, "Assignment id");
        errors.addAll(validator.validateAssignment(request));
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }
        ShiftAssignmentResponse response = assignmentService.updateAssignment(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> deleteAssignment(@PathVariable("id") Integer id) {
        List<String> errors = validator.validateId(id, "Assignment id");
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(new MessageResponse("Assignment deleted"));
    }

    @PostMapping("/swap/execute")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> executeSwap(@RequestBody ShiftSwapExecuteRequest request) {
        String message = assignmentService.executeSwap(request);
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @GetMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> listAttendance(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "status", required = false) String status) {
        List<AttendanceResponse> responses = workforceService.listAttendance(date, startDate, endDate, userId, status);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> upsertAttendance(@RequestBody AttendanceUpsertRequest request) {
        AttendanceResponse response = workforceService.upsertAttendance(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payroll/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> payrollSummary(
            @RequestParam(value = "month", required = false) String month,
            @RequestParam(value = "fromMonth", required = false) String fromMonth,
            @RequestParam(value = "toMonth", required = false) String toMonth,
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "hourlyRate", required = false) BigDecimal hourlyRate) {
        PayrollSummaryResponse response = workforceService.buildPayrollSummary(month, fromMonth, toMonth, userId,
                hourlyRate);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/payroll/mark-paid")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> markPayrollAsPaid(
            @RequestParam("month") String month,
            @RequestParam(value = "userId", required = false) Integer userId) {
        // Lấy email người đang đăng nhập để gửi mail xác nhận
        String callerEmail = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.smalltrend.entity.User caller) {
            callerEmail = caller.getEmail();
        }
        String message = workforceService.markPayrollAsPaid(month, userId, callerEmail);
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @GetMapping("/workforce/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> workforceDashboard(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "month", required = false) String month,
            @RequestParam(value = "fromMonth", required = false) String fromMonth,
            @RequestParam(value = "toMonth", required = false) String toMonth,
            @RequestParam(value = "paymentDueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paymentDueDate) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<AttendanceResponse> attendanceRows = workforceService.listAttendance(targetDate, targetDate, targetDate,
                userId, "ALL");

        int total = attendanceRows.size();
        int present = (int) attendanceRows.stream().filter(item -> "PRESENT".equalsIgnoreCase(item.getStatus())).count();
        int late = (int) attendanceRows.stream().filter(item -> "LATE".equalsIgnoreCase(item.getStatus())).count();
        int absent = (int) attendanceRows.stream().filter(item -> "ABSENT".equalsIgnoreCase(item.getStatus())).count();
        int onLeave = (int) attendanceRows.stream().filter(item -> "ON_LEAVE".equalsIgnoreCase(item.getStatus())).count();

        if (total == 0) {
            YearMonth startMonth = fromMonth != null && !fromMonth.isBlank()
                    ? YearMonth.parse(fromMonth)
                    : (month != null && !month.isBlank() ? YearMonth.parse(month) : YearMonth.now());
            YearMonth endMonth = toMonth != null && !toMonth.isBlank() ? YearMonth.parse(toMonth) : startMonth;

            List<AttendanceResponse> monthlyRows = workforceService.listAttendance(
                    startMonth.atDay(1),
                    startMonth.atDay(1),
                    endMonth.atEndOfMonth(),
                    userId,
                    "ALL");

            if (!monthlyRows.isEmpty()) {
                total = monthlyRows.size();
                present = (int) monthlyRows.stream().filter(item -> "PRESENT".equalsIgnoreCase(item.getStatus())).count();
                late = (int) monthlyRows.stream().filter(item -> "LATE".equalsIgnoreCase(item.getStatus())).count();
                absent = (int) monthlyRows.stream().filter(item -> "ABSENT".equalsIgnoreCase(item.getStatus())).count();
                onLeave = (int) monthlyRows.stream().filter(item -> "ON_LEAVE".equalsIgnoreCase(item.getStatus())).count();
            }
        }

        PayrollSummaryResponse payroll = workforceService.buildPayrollSummary(month, fromMonth, toMonth, userId, null);
        Map<String, Object> paymentStatus = workforceService.buildPayrollPaymentStatus(
                month,
                fromMonth,
                toMonth,
                paymentDueDate,
                userId);

        return ResponseEntity.ok(java.util.Map.of(
                "date", targetDate,
                "attendance", java.util.Map.of(
                        "total", total,
                        "present", present,
                        "late", late,
                        "absent", absent,
                        "onLeave", onLeave),
                "payroll", java.util.Map.of(
                        "staffCount", payroll.getStaffCount(),
                        "totalHours", payroll.getTotalHours(),
                        "totalPayroll", payroll.getTotalPayroll(),
                        "month", payroll.getMonth()),
                "paymentStatus", paymentStatus));
    }
}
