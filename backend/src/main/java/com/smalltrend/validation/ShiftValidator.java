package com.smalltrend.validation;

import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.WorkShiftRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class ShiftValidator {

    public List<String> validateShift(WorkShiftRequest request) {
        List<String> errors = new ArrayList<>();

        if (request.getShiftCode() == null || request.getShiftCode().trim().isEmpty()) {
            errors.add("Shift code is required");
        }

        if (request.getShiftName() == null || request.getShiftName().trim().isEmpty()) {
            errors.add("Shift name is required");
        }

        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();
        if (startTime == null || endTime == null) {
            errors.add("Start time and end time are required");
        } else if (!endTime.isAfter(startTime)) {
            errors.add("End time must be after start time");
        }

        LocalTime breakStart = request.getBreakStartTime();
        LocalTime breakEnd = request.getBreakEndTime();
        if ((breakStart == null) != (breakEnd == null)) {
            errors.add("Break start and end must be provided together");
        }

        if (breakStart != null && breakEnd != null) {
            if (!breakEnd.isAfter(breakStart)) {
                errors.add("Break end must be after break start");
            }
            if (startTime != null && (breakStart.isBefore(startTime) || breakEnd.isAfter(endTime))) {
                errors.add("Break time must be within shift time");
            }
        }

        Integer minStaff = request.getMinimumStaffRequired();
        Integer maxStaff = request.getMaximumStaffAllowed();
        if (minStaff != null && minStaff < 0) {
            errors.add("Minimum staff must be 0 or greater");
        }
        if (maxStaff != null && maxStaff < 0) {
            errors.add("Maximum staff must be 0 or greater");
        }
        if (minStaff != null && maxStaff != null && minStaff > maxStaff) {
            errors.add("Minimum staff cannot exceed maximum staff");
        }

        return errors;
    }

    public List<String> validateAssignment(ShiftAssignmentRequest request) {
        List<String> errors = new ArrayList<>();

        if (request.getWorkShiftId() == null || request.getWorkShiftId() <= 0) {
            errors.add("Work shift is required");
        }
        if (request.getUserId() == null || request.getUserId() <= 0) {
            errors.add("User is required");
        }
        if (request.getShiftDate() == null) {
            errors.add("Shift date is required");
        }
        return errors;
    }

    public List<String> validateId(Integer id, String fieldName) {
        List<String> errors = new ArrayList<>();
        if (id == null || id <= 0) {
            errors.add(fieldName + " is invalid");
        }
        return errors;
    }

    public List<String> validateDateRange(LocalDate startDate, LocalDate endDate) {
        List<String> errors = new ArrayList<>();
        if (startDate == null || endDate == null) {
            errors.add("Start date and end date are required");
            return errors;
        }
        if (endDate.isBefore(startDate)) {
            errors.add("End date must be after start date");
        }
        return errors;
    }

    public boolean hasErrors(List<String> errors) {
        return errors != null && !errors.isEmpty();
    }

    public String errorsToString(List<String> errors) {
        return String.join("; ", errors);
    }
}
