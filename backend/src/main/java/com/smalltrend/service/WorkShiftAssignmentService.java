package com.smalltrend.service;

import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.ShiftAssignmentResponse;
import com.smalltrend.entity.User;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.entity.WorkShiftAssignment;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.repository.WorkShiftAssignmentRepository;
import com.smalltrend.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkShiftAssignmentService {

    private final WorkShiftAssignmentRepository assignmentRepository;
    private final WorkShiftRepository workShiftRepository;
    private final UserRepository userRepository;

    public ShiftAssignmentResponse createAssignment(ShiftAssignmentRequest request) {
        WorkShift shift = workShiftRepository.findById(request.getWorkShiftId())
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (assignmentRepository.existsByWorkShiftIdAndUserIdAndShiftDate(
                request.getWorkShiftId(),
                request.getUserId(),
                request.getShiftDate())) {
            throw new RuntimeException("Assignment already exists for this shift and date");
        }

        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .workShift(shift)
                .user(user)
                .shiftDate(request.getShiftDate())
                .status(normalizeStatus(request.getStatus()))
                .notes(request.getNotes())
                .build();

        WorkShiftAssignment saved = assignmentRepository.save(assignment);
        return toResponse(saved);
    }

    public ShiftAssignmentResponse updateAssignment(Integer id, ShiftAssignmentRequest request) {
        WorkShiftAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        WorkShift shift = workShiftRepository.findById(request.getWorkShiftId())
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (assignmentRepository.existsByWorkShiftIdAndUserIdAndShiftDate(
                request.getWorkShiftId(),
                request.getUserId(),
                request.getShiftDate()) &&
                !(assignment.getWorkShift().getId().equals(request.getWorkShiftId())
                        && assignment.getUser().getId().equals(request.getUserId())
                        && assignment.getShiftDate().equals(request.getShiftDate()))) {
            throw new RuntimeException("Assignment already exists for this shift and date");
        }

        assignment.setWorkShift(shift);
        assignment.setUser(user);
        assignment.setShiftDate(request.getShiftDate());
        assignment.setStatus(normalizeStatus(request.getStatus()));
        assignment.setNotes(request.getNotes());

        WorkShiftAssignment saved = assignmentRepository.save(assignment);
        return toResponse(saved);
    }

    public ShiftAssignmentResponse getAssignment(Integer id) {
        WorkShiftAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return toResponse(assignment);
    }

    public List<ShiftAssignmentResponse> listAssignments(LocalDate startDate, LocalDate endDate, Integer userId,
            Integer shiftId) {
        List<WorkShiftAssignment> assignments;
        if (userId != null) {
            assignments = assignmentRepository.findByUserIdAndShiftDateBetween(userId, startDate, endDate);
        } else {
            assignments = assignmentRepository.findByShiftDateBetween(startDate, endDate);
        }

        if (shiftId != null) {
            assignments = assignments.stream()
                    .filter(item -> item.getWorkShift() != null && shiftId.equals(item.getWorkShift().getId()))
                    .collect(Collectors.toList());
        }

        return assignments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteAssignment(Integer id) {
        if (!assignmentRepository.existsById(id)) {
            throw new RuntimeException("Assignment not found");
        }
        assignmentRepository.deleteById(id);
    }

    private ShiftAssignmentResponse toResponse(WorkShiftAssignment assignment) {
        return ShiftAssignmentResponse.builder()
                .id(assignment.getId())
                .shiftDate(assignment.getShiftDate())
                .status(assignment.getStatus())
                .notes(assignment.getNotes())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .shift(ShiftAssignmentResponse.ShiftSummary.builder()
                        .id(assignment.getWorkShift().getId())
                        .shiftCode(assignment.getWorkShift().getShiftCode())
                        .shiftName(assignment.getWorkShift().getShiftName())
                        .startTime(assignment.getWorkShift().getStartTime())
                        .endTime(assignment.getWorkShift().getEndTime())
                        .build())
                .user(ShiftAssignmentResponse.UserSummary.builder()
                        .id(assignment.getUser().getId())
                        .fullName(assignment.getUser().getFullName())
                        .email(assignment.getUser().getEmail())
                        .build())
                .build();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return "ASSIGNED";
        }
        return status.trim().toUpperCase();
    }
}
