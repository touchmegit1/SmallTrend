package com.smalltrend.validation;

import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.WorkShiftRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ShiftValidatorTest {

    private ShiftValidator validator;

    @BeforeEach
    void setUp() {
        validator = new ShiftValidator();
    }

    @Test
    void validateShift_shouldReturnEmpty_whenRequestIsValid() {
        WorkShiftRequest request = WorkShiftRequest.builder()
                .shiftCode("SHIFT-A")
                .shiftName("Ca sang")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .breakStartTime(LocalTime.of(12, 0))
                .breakEndTime(LocalTime.of(13, 0))
                .minimumStaffRequired(2)
                .maximumStaffAllowed(5)
                .shiftType("REGULAR")
                .build();

        List<String> errors = validator.validateShift(request);

        assertTrue(errors.isEmpty());
    }

    @Test
    void validateShift_shouldCollectExpectedErrors_whenInvalid() {
        WorkShiftRequest request = WorkShiftRequest.builder()
                .shiftCode(" ")
                .shiftName("")
                .startTime(LocalTime.of(17, 0))
                .endTime(LocalTime.of(17, 0))
                .breakStartTime(LocalTime.of(7, 0))
                .breakEndTime(null)
                .minimumStaffRequired(5)
                .maximumStaffAllowed(2)
                .shiftType("TEMPORARY")
                .effectiveFrom(LocalDate.of(2026, 4, 10))
                .effectiveTo(LocalDate.of(2026, 4, 1))
                .build();

        List<String> errors = validator.validateShift(request);

        assertTrue(errors.contains("Shift code is required"));
        assertTrue(errors.contains("Shift name is required"));
        assertTrue(errors.contains("Start time and end time cannot be equal"));
        assertTrue(errors.contains("Break start and end must be provided together"));
        assertTrue(errors.contains("Minimum staff cannot exceed maximum staff"));
        assertTrue(errors.contains("Effective to date must be after or equal to effective from date"));
    }

    @Test
    void validateShift_shouldRequireTemporaryDates_whenShiftTypeTemporary() {
        WorkShiftRequest request = WorkShiftRequest.builder()
                .shiftCode("TEMP-A")
                .shiftName("Ca tam")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(12, 0))
                .shiftType("TEMPORARY")
                .build();

        List<String> errors = validator.validateShift(request);

        assertTrue(errors.contains("Effective from date is required for temporary shift"));
        assertTrue(errors.contains("Effective to date is required for temporary shift"));
    }

    @Test
    void validateShift_shouldValidateCoefficientAndMinutesRange() {
        WorkShiftRequest request = WorkShiftRequest.builder()
                .shiftCode("SHIFT-CHECK")
                .shiftName("Ca test")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(16, 0))
                .overtimeMultiplier(new BigDecimal("0.5"))
                .nightShiftBonus(new BigDecimal("-1"))
                .weekendBonus(new BigDecimal("500"))
                .gracePeriodMinutes(-1)
                .build();

        List<String> errors = validator.validateShift(request);

        assertTrue(errors.contains("Overtime multiplier must be between 1.00 and 5.00"));
        assertTrue(errors.contains("Night shift bonus must be between 0 and 300.00"));
        assertTrue(errors.contains("Weekend bonus must be between 0 and 300.00"));
        assertTrue(errors.contains("Grace period minutes must be 0 or greater"));
    }

    @Test
    void validateAssignment_shouldReturnErrors_whenAssignmentMissingFields() {
        ShiftAssignmentRequest request = ShiftAssignmentRequest.builder()
                .workShiftId(0)
                .userId(null)
                .shiftDate(null)
                .build();

        List<String> errors = validator.validateAssignment(request);

        assertTrue(errors.contains("Work shift is required"));
        assertTrue(errors.contains("User is required"));
        assertTrue(errors.contains("Shift date is required"));
    }

    @Test
    void validateDateRange_shouldReturnError_whenEndBeforeStart() {
        List<String> errors = validator.validateDateRange(LocalDate.of(2026, 3, 10), LocalDate.of(2026, 3, 1));
        assertTrue(errors.contains("End date must be after start date"));
    }

    @Test
    void validateId_hasErrors_errorsToString_shouldBehaveAsExpected() {
        List<String> errors = validator.validateId(0, "Shift id");

        assertFalse(errors.isEmpty());
        assertTrue(validator.hasErrors(errors));
        assertEquals("Shift id is invalid", validator.errorsToString(errors));
    }
}
