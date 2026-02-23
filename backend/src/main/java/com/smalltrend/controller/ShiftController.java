package com.smalltrend.controller;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.ShiftAssignmentResponse;
import com.smalltrend.dto.shift.WorkShiftRequest;
import com.smalltrend.dto.shift.WorkShiftResponse;
import com.smalltrend.service.WorkShiftAssignmentService;
import com.smalltrend.service.WorkShiftService;
import com.smalltrend.validation.ShiftValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ShiftController {

    private final WorkShiftService workShiftService;
    private final WorkShiftAssignmentService assignmentService;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> listShifts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status) {
        List<WorkShiftResponse> shifts = workShiftService.listShifts(query, status);
        return ResponseEntity.ok(shifts);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> getShift(@PathVariable Integer id) {
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
    public ResponseEntity<?> updateShift(@PathVariable Integer id, @Valid @RequestBody WorkShiftRequest request) {
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
    public ResponseEntity<?> deleteShift(@PathVariable Integer id) {
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> listAssignments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer shiftId) {
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> getAssignment(@PathVariable Integer id) {
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
            @PathVariable Integer id,
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
    public ResponseEntity<?> deleteAssignment(@PathVariable Integer id) {
        List<String> errors = validator.validateId(id, "Assignment id");
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(new MessageResponse("Assignment deleted"));
    }
}
