package com.smalltrend.service;

import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.ShiftAssignmentResponse;
import com.smalltrend.entity.User;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.entity.WorkShiftAssignment;
import com.smalltrend.repository.AttendanceRepository;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.repository.WorkShiftAssignmentRepository;
import com.smalltrend.repository.WorkShiftRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkShiftAssignmentServiceTest {

    @Mock
    private WorkShiftAssignmentRepository assignmentRepository;

    @Mock
    private WorkShiftRepository workShiftRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    private WorkShiftAssignmentService service;

    @BeforeEach
    void setUp() {
        service = new WorkShiftAssignmentService(
                assignmentRepository,
                workShiftRepository,
                userRepository,
                attendanceRepository);
    }

    @Test
    void createAssignment_shouldReject_whenShiftOverlapsExistingAssignment() {
        LocalDate shiftDate = LocalDate.of(2026, 3, 20);
        User user = User.builder().id(10).build();

        WorkShift newShift = WorkShift.builder()
                .id(101)
                .status("ACTIVE")
                .startTime(LocalTime.of(13, 0))
                .endTime(LocalTime.of(22, 0))
                .build();

        WorkShift existingShift = WorkShift.builder()
                .id(102)
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .build();

        WorkShiftAssignment existing = WorkShiftAssignment.builder()
                .id(1001)
                .user(user)
                .workShift(existingShift)
                .shiftDate(shiftDate)
                .deleted(false)
                .build();

        ShiftAssignmentRequest request = ShiftAssignmentRequest.builder()
                .workShiftId(101)
                .userId(10)
                .shiftDate(shiftDate)
                .notes("overlap case")
                .build();

        when(workShiftRepository.findById(101)).thenReturn(Optional.of(newShift));
        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(assignmentRepository.existsByWorkShiftIdAndUserIdAndShiftDateAndDeletedFalse(101, 10, shiftDate))
                .thenReturn(false);
        when(assignmentRepository.findByUserIdAndShiftDateAndDeletedFalse(10, shiftDate))
                .thenReturn(List.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.createAssignment(request));

        assertEquals("Không thể phân ca bị overlap: ca mới bắt đầu trước khi ca còn lại kết thúc", ex.getMessage());
    }

    @Test
    void createAssignment_shouldSucceed_whenShiftDoesNotOverlap() {
        LocalDate shiftDate = LocalDate.of(2026, 3, 20);
        User user = User.builder().id(11).email("u11@mail.com").fullName("U11").build();

        WorkShift newShift = WorkShift.builder()
                .id(201)
                .status("ACTIVE")
                .shiftCode("SFT-E")
                .shiftName("Ca tối")
                .startTime(LocalTime.of(18, 0))
                .endTime(LocalTime.of(23, 0))
                .build();

        WorkShift existingShift = WorkShift.builder()
                .id(202)
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .build();

        WorkShiftAssignment existing = WorkShiftAssignment.builder()
                .id(2001)
                .user(user)
                .workShift(existingShift)
                .shiftDate(shiftDate)
                .deleted(false)
                .build();

        ShiftAssignmentRequest request = ShiftAssignmentRequest.builder()
                .workShiftId(201)
                .userId(11)
                .shiftDate(shiftDate)
                .notes("non overlap")
                .build();

        when(workShiftRepository.findById(201)).thenReturn(Optional.of(newShift));
        when(userRepository.findById(11)).thenReturn(Optional.of(user));
        when(assignmentRepository.existsByWorkShiftIdAndUserIdAndShiftDateAndDeletedFalse(201, 11, shiftDate))
                .thenReturn(false);
        when(assignmentRepository.findByUserIdAndShiftDateAndDeletedFalse(11, shiftDate))
                .thenReturn(List.of(existing));
        when(assignmentRepository.save(any(WorkShiftAssignment.class)))
                .thenAnswer(invocation -> {
                    WorkShiftAssignment value = invocation.getArgument(0);
                    value.setId(9999);
                    return value;
                });

        ShiftAssignmentResponse response = service.createAssignment(request);

        assertNotNull(response);
        assertEquals(9999, response.getId());
        verify(assignmentRepository).save(any(WorkShiftAssignment.class));
    }
}
