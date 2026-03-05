package com.smalltrend.service;

import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.ShiftAssignmentResponse;
import com.smalltrend.dto.shift.ShiftSwapExecuteRequest;
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

        if (assignmentRepository.existsByWorkShiftIdAndUserIdAndShiftDateAndDeletedFalse(
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

        if (assignmentRepository.existsByWorkShiftIdAndUserIdAndShiftDateAndDeletedFalse(
                request.getWorkShiftId(),
                request.getUserId(),
                request.getShiftDate())
                && !(assignment.getWorkShift().getId().equals(request.getWorkShiftId())
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
            assignments = assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(userId, startDate, endDate);
        } else {
            assignments = assignmentRepository.findByShiftDateBetweenAndDeletedFalse(startDate, endDate);
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
        WorkShiftAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setDeleted(true);
        assignmentRepository.save(assignment);
    }

        public String executeSwap(ShiftSwapExecuteRequest request) {
                if (request.getRequesterAssignmentId() == null || request.getTargetAssignmentId() == null) {
                        throw new RuntimeException("Thiếu thông tin phân ca để thực hiện đổi ca");
                }
                if (request.getRequesterAssignmentId().equals(request.getTargetAssignmentId())) {
                        throw new RuntimeException("Hai phân ca đổi không được trùng nhau");
                }

                WorkShiftAssignment requesterAssignment = assignmentRepository.findByIdAndDeletedFalse(request.getRequesterAssignmentId())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm của người yêu cầu"));

                WorkShiftAssignment targetAssignment = assignmentRepository.findByIdAndDeletedFalse(request.getTargetAssignmentId())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm của người được đổi"));

                Integer accepterUserId = request.getAccepterUserId();
                if (accepterUserId == null) {
                        throw new RuntimeException("Thiếu thông tin người xác nhận đổi ca");
                }

                if (!targetAssignment.getUser().getId().equals(accepterUserId)) {
                        throw new RuntimeException("Chỉ nhân viên sở hữu ca đích mới có thể xác nhận đổi ca");
                }

                User requesterUser = requesterAssignment.getUser();
                User targetUser = targetAssignment.getUser();

                requesterAssignment.setUser(targetUser);
                targetAssignment.setUser(requesterUser);

                String requesterOldNote = requesterAssignment.getNotes() == null ? "" : requesterAssignment.getNotes();
                String targetOldNote = targetAssignment.getNotes() == null ? "" : targetAssignment.getNotes();
                String swapAuditText = " [SWAP EXECUTED]";

                requesterAssignment.setNotes((requesterOldNote + swapAuditText).trim());
                targetAssignment.setNotes((targetOldNote + swapAuditText).trim());

                assignmentRepository.save(requesterAssignment);
                assignmentRepository.save(targetAssignment);

                return "Đổi ca thành công cho cả hai nhân viên";
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
