package com.smalltrend.service.shift;

import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.ShiftAssignmentResponse;
import com.smalltrend.dto.shift.ShiftSwapExecuteRequest;
import com.smalltrend.entity.Attendance;
import com.smalltrend.entity.User;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.entity.WorkShiftAssignment;
import com.smalltrend.repository.AttendanceRepository;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.repository.WorkShiftAssignmentRepository;
import com.smalltrend.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkShiftAssignmentService {

    private final WorkShiftAssignmentRepository assignmentRepository;
    private final WorkShiftRepository workShiftRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;

    public ShiftAssignmentResponse createAssignment(ShiftAssignmentRequest request) {
        WorkShift shift = workShiftRepository.findById(request.getWorkShiftId())
                .orElseThrow(() -> new RuntimeException("Shift not found"));
        validateShiftForDate(shift, request.getShiftDate());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (assignmentRepository.existsByWorkShiftIdAndUserIdAndShiftDateAndDeletedFalse(
                request.getWorkShiftId(),
                request.getUserId(),
                request.getShiftDate())) {
            throw new RuntimeException("Assignment already exists for this shift and date");
        }

        ensureNoOverlappingAssignment(user.getId(), request.getShiftDate(), shift, Set.of());

        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .workShift(shift)
                .user(user)
                .shiftDate(request.getShiftDate())
                .status("ASSIGNED")
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
        validateShiftForDate(shift, request.getShiftDate());

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

        ensureNoOverlappingAssignment(user.getId(), request.getShiftDate(), shift, Set.of(assignment.getId()));

        assignment.setWorkShift(shift);
        assignment.setUser(user);
        assignment.setShiftDate(request.getShiftDate());
        assignment.setStatus(normalizeEditableStatus(request.getStatus(), assignment.getStatus()));
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

        if (!isRecentlyAssigned(assignment)) {
            String assignmentStatus = Optional.ofNullable(assignment.getStatus()).orElse("").trim().toUpperCase();
            boolean isUnchangedAssignment = assignmentStatus.isBlank() || "ASSIGNED".equals(assignmentStatus);
            if (!isUnchangedAssignment) {
                throw new RuntimeException("Không thể xóa ca đã chuyển trạng thái");
            }
        }

        Optional<Attendance> attendanceOpt = attendanceRepository.findByUserIdAndDate(
                assignment.getUser().getId(),
                assignment.getShiftDate());

        if (attendanceOpt.isPresent()) {
            Attendance attendance = attendanceOpt.get();
            String status = Optional.ofNullable(attendance.getStatus()).orElse("").trim().toUpperCase();
            boolean hasCheckinData = attendance.getTimeIn() != null || attendance.getTimeOut() != null;
            boolean hasStatusProgress = !status.isBlank() && !"PENDING".equals(status);

            if (hasCheckinData || hasStatusProgress) {
                throw new RuntimeException("Không thể xóa ca đã có dữ liệu chấm công");
            }
        }

        assignment.setDeleted(true);
        assignmentRepository.save(assignment);
    }

    private boolean isRecentlyAssigned(WorkShiftAssignment assignment) {
        LocalDateTime createdAt = assignment.getCreatedAt();
        if (createdAt == null) {
            return false;
        }
        return !createdAt.plusMinutes(10).isBefore(LocalDateTime.now());
    }

    public String executeSwap(ShiftSwapExecuteRequest request) {
        if (request.getRequesterAssignmentId() == null) {
            throw new RuntimeException("Thiếu thông tin ca của người yêu cầu");
        }

        WorkShiftAssignment requesterAssignment = assignmentRepository.findByIdAndDeletedFalse(request.getRequesterAssignmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm của người yêu cầu"));

        Integer accepterUserId = request.getAccepterUserId();
        if (accepterUserId == null) {
            throw new RuntimeException("Thiếu thông tin người xác nhận đổi ca");
        }

        if (!isFutureOrToday(requesterAssignment.getShiftDate())) {
            throw new RuntimeException("Ca của người yêu cầu đã qua, không thể xử lý đổi ca");
        }

        if (isAttendanceCompleted(requesterAssignment.getUser().getId(), requesterAssignment.getShiftDate())) {
            throw new RuntimeException("Ca của người yêu cầu đã chấm công, không thể đổi");
        }

        if (requesterAssignment.getUser().getId().equals(accepterUserId)) {
            throw new RuntimeException("Không thể tự chấp nhận đổi ca cho chính ca của mình");
        }

        WorkShiftAssignment targetAssignment = null;
        boolean twoWaySwap = request.getTargetAssignmentId() != null;

        if (twoWaySwap) {
            if (request.getRequesterAssignmentId().equals(request.getTargetAssignmentId())) {
                throw new RuntimeException("Hai phân ca đổi không được trùng nhau");
            }

            targetAssignment = assignmentRepository.findByIdAndDeletedFalse(request.getTargetAssignmentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm của người được đổi"));

            if (!targetAssignment.getUser().getId().equals(accepterUserId)) {
                throw new RuntimeException("Chỉ nhân viên sở hữu ca đối ứng mới có thể xác nhận đổi hai chiều");
            }

            if (!isFutureOrToday(targetAssignment.getShiftDate())) {
                throw new RuntimeException("Ca đối ứng đã qua, không thể dùng để đổi");
            }

            if (isAttendanceCompleted(targetAssignment.getUser().getId(), targetAssignment.getShiftDate())) {
                throw new RuntimeException("Ca đối ứng đã chấm công, không thể dùng để đổi");
            }

            if (requesterAssignment.getShiftDate().equals(targetAssignment.getShiftDate())
                    && requesterAssignment.getWorkShift() != null
                    && targetAssignment.getWorkShift() != null
                    && requesterAssignment.getWorkShift().getId().equals(targetAssignment.getWorkShift().getId())) {
                throw new RuntimeException("Không thể đổi ca với người đã được xếp cùng ca");
            }
        }

        User accepterUser = userRepository.findById(accepterUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người chấp nhận đổi ca"));

        if (twoWaySwap) {
            User requesterUser = requesterAssignment.getUser();
            User targetUser = targetAssignment.getUser();

            ensureNoOverlappingAssignment(
                    targetUser.getId(),
                    requesterAssignment.getShiftDate(),
                    requesterAssignment.getWorkShift(),
                    setOfIds(targetAssignment.getId(), requesterAssignment.getId()));
            ensureNoOverlappingAssignment(
                    requesterUser.getId(),
                    targetAssignment.getShiftDate(),
                    targetAssignment.getWorkShift(),
                    setOfIds(requesterAssignment.getId(), targetAssignment.getId()));

            requesterAssignment.setUser(targetUser);
            targetAssignment.setUser(requesterUser);
            requesterAssignment.setStatus("ASSIGNED");
            targetAssignment.setStatus("ASSIGNED");

            reassignPendingAttendanceIfNeeded(
                    requesterUser,
                    targetUser,
                    requesterAssignment.getShiftDate(),
                    requesterAssignment.getId(),
                    requesterAssignment.getWorkShift());
            reassignPendingAttendanceIfNeeded(
                    targetUser,
                    requesterUser,
                    targetAssignment.getShiftDate(),
                    targetAssignment.getId(),
                    targetAssignment.getWorkShift());
        } else {
            User requesterUser = requesterAssignment.getUser();
            ensureNoOverlappingAssignment(
                    accepterUser.getId(),
                    requesterAssignment.getShiftDate(),
                    requesterAssignment.getWorkShift(),
                    Set.of(requesterAssignment.getId()));
            requesterAssignment.setUser(accepterUser);
            requesterAssignment.setStatus("ASSIGNED");
            reassignPendingAttendanceIfNeeded(
                    requesterUser,
                    accepterUser,
                    requesterAssignment.getShiftDate(),
                    requesterAssignment.getId(),
                    requesterAssignment.getWorkShift());
        }

        String requesterOldNote = requesterAssignment.getNotes() == null ? "" : requesterAssignment.getNotes();
        String swapAuditText = twoWaySwap ? " [SWAP EXECUTED - TWO_WAY]" : " [SWAP EXECUTED - TAKE_OVER]";

        requesterAssignment.setNotes((requesterOldNote + swapAuditText).trim());

        assignmentRepository.save(requesterAssignment);
        if (twoWaySwap) {
            String targetOldNote = targetAssignment.getNotes() == null ? "" : targetAssignment.getNotes();
            targetAssignment.setNotes((targetOldNote + swapAuditText).trim());
            assignmentRepository.save(targetAssignment);
        }

        return twoWaySwap
                ? "Đổi ca hai chiều thành công"
                : "Nhận ca thay thành công";
    }

    private boolean isFutureOrToday(LocalDate date) {
        return date != null && !date.isBefore(LocalDate.now());
    }

    private boolean isAttendanceCompleted(Integer userId, LocalDate date) {
        return attendanceRepository.findByUserIdAndDate(userId, date)
                .map(attendance -> {
                    String status = Optional.ofNullable(attendance.getStatus()).orElse("").trim().toUpperCase();
                    return "PRESENT".equals(status) || "LATE".equals(status);
                })
                .orElse(false);
    }

    private void reassignPendingAttendanceIfNeeded(
            User oldUser,
            User newUser,
            LocalDate shiftDate,
            Integer assignmentId,
            WorkShift shift) {
        if (oldUser == null || newUser == null || shiftDate == null || assignmentId == null) {
            return;
        }

        Optional<Attendance> pendingAttendanceOpt = attendanceRepository.findByUserIdAndDate(oldUser.getId(), shiftDate)
                .filter(attendance -> {
                    String status = Optional.ofNullable(attendance.getStatus()).orElse("").trim().toUpperCase();
                    return "PENDING".equals(status);
                });

        if (pendingAttendanceOpt.isEmpty()) {
            return;
        }

        Attendance pendingAttendance = pendingAttendanceOpt.get();
        pendingAttendance.setUser(newUser);
        pendingAttendance.setAssignmentIdSnapshot(assignmentId);
        if (shift != null) {
            pendingAttendance.setShiftIdSnapshot(shift.getId());
            pendingAttendance.setShiftNameSnapshot(shift.getShiftName());
            pendingAttendance.setShiftStartSnapshot(shift.getStartTime());
            pendingAttendance.setShiftEndSnapshot(shift.getEndTime());
            pendingAttendance.setShiftWorkingMinutesSnapshot(shift.getWorkingMinutes());
        }
        attendanceRepository.save(pendingAttendance);
    }

    private void validateShiftForDate(WorkShift shift, LocalDate shiftDate) {
        if (shiftDate == null) {
            throw new RuntimeException("Shift date is required");
        }

        if (!"ACTIVE".equalsIgnoreCase(Optional.ofNullable(shift.getStatus()).orElse(""))) {
            throw new RuntimeException("Ca làm đã ngưng hoạt động");
        }

        LocalDate effectiveFrom = shift.getEffectiveFrom();
        LocalDate effectiveTo = shift.getEffectiveTo();

        if (effectiveFrom != null && shiftDate.isBefore(effectiveFrom)) {
            throw new RuntimeException("Ngày phân ca trước thời gian hiệu lực của ca");
        }

        if (effectiveTo != null && shiftDate.isAfter(effectiveTo)) {
            throw new RuntimeException("Ca làm đã hết hiệu lực theo thời gian cấu hình");
        }
    }

    private void ensureNoOverlappingAssignment(
            Integer userId,
            LocalDate shiftDate,
            WorkShift candidateShift,
            Set<Integer> excludedAssignmentIds) {
        if (userId == null || shiftDate == null || candidateShift == null) {
            return;
        }

        List<WorkShiftAssignment> sameDayAssignments = assignmentRepository
                .findByUserIdAndShiftDateAndDeletedFalse(userId, shiftDate);

        for (WorkShiftAssignment existing : sameDayAssignments) {
            if (existing == null || existing.getId() == null) {
                continue;
            }

            if (excludedAssignmentIds.contains(existing.getId())) {
                continue;
            }

            WorkShift existingShift = existing.getWorkShift();
            if (existingShift == null) {
                continue;
            }

            if (hasShiftOverlap(candidateShift, existingShift)) {
                throw new RuntimeException(
                        "Không thể phân ca bị overlap: ca mới bắt đầu trước khi ca còn lại kết thúc");
            }
        }
    }

    private boolean hasShiftOverlap(WorkShift candidateShift, WorkShift existingShift) {
        LocalTime candidateStart = candidateShift.getStartTime();
        LocalTime candidateEnd = candidateShift.getEndTime();
        LocalTime existingStart = existingShift.getStartTime();
        LocalTime existingEnd = existingShift.getEndTime();

        if (candidateStart == null || candidateEnd == null || existingStart == null || existingEnd == null) {
            return false;
        }

        long dayMinutes = 24 * 60;
        long cStart = candidateStart.toSecondOfDay() / 60;
        long cEnd = candidateEnd.toSecondOfDay() / 60;
        long eStart = existingStart.toSecondOfDay() / 60;
        long eEnd = existingEnd.toSecondOfDay() / 60;

        if (cEnd <= cStart) {
            cEnd += dayMinutes;
        }

        if (eEnd <= eStart) {
            eEnd += dayMinutes;
        }

        return rangesOverlap(cStart, cEnd, eStart, eEnd)
                || rangesOverlap(cStart, cEnd, eStart + dayMinutes, eEnd + dayMinutes)
                || rangesOverlap(cStart + dayMinutes, cEnd + dayMinutes, eStart, eEnd);
    }

    private boolean rangesOverlap(long startA, long endA, long startB, long endB) {
        return startA < endB && startB < endA;
    }

    private Set<Integer> setOfIds(Integer... ids) {
        Set<Integer> values = new HashSet<>();
        if (ids == null) {
            return values;
        }

        for (Integer id : ids) {
            if (id != null) {
                values.add(id);
            }
        }

        return values;
    }

    private ShiftAssignmentResponse toResponse(WorkShiftAssignment assignment) {
        WorkShift shift = assignment.getWorkShift();
        User user = assignment.getUser();

        return ShiftAssignmentResponse.builder()
                .id(assignment.getId())
                .shiftDate(assignment.getShiftDate())
                .status(assignment.getStatus())
                .notes(assignment.getNotes())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .shift(shift == null ? null : ShiftAssignmentResponse.ShiftSummary.builder()
                        .id(shift.getId())
                        .shiftCode(shift.getShiftCode())
                        .shiftName(shift.getShiftName())
                        .startTime(shift.getStartTime())
                        .endTime(shift.getEndTime())
                        .build())
                .user(user == null ? null : ShiftAssignmentResponse.UserSummary.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .build())
                .build();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return "ASSIGNED";
        }
        return status.trim().toUpperCase();
    }

    private String normalizeEditableStatus(String requestedStatus, String currentStatus) {
        String normalized = normalizeStatus(requestedStatus);
        if ("COMPLETED".equals(normalized) || "CANCELLED".equals(normalized)) {
            return normalizeStatus(currentStatus);
        }
        return normalized;
    }
}
