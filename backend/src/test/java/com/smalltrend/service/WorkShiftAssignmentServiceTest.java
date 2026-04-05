package com.smalltrend.service;

import com.smalltrend.dto.shift.ShiftAssignmentRequest;
import com.smalltrend.dto.shift.ShiftAssignmentResponse;
import com.smalltrend.entity.Attendance;
import com.smalltrend.entity.User;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.entity.WorkShiftAssignment;
import com.smalltrend.repository.AttendanceRepository;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.repository.WorkShiftAssignmentRepository;
import com.smalltrend.repository.WorkShiftRepository;
import com.smalltrend.service.shift.WorkShiftAssignmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
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
                        when(assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(10, shiftDate.minus
                               Days(1),
                                                shiftDate.plusDays(1)))
                                .thenReturn(List.of(existing));

                        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.createAssignment(request));

                            assertTrue(ex.getMessage().contains("Không thể phân ca bị overlap"));
        }

                @Test
                void createAssignment_shouldReject_whenOvernightShiftOverlapsNextDayAssignment() {
                        LocalDate shiftDate = LocalDate.of(2026, 3, 20);
                User user = User.builder().id(12).build();

                                        WorkShift overnightShift = WorkShift.builder()
                                                .id(301)
                                                .status("ACTIVE")
                                                .shiftName("Ca dem")
                                                .startTime(LocalTime.of(22, 0))
                                                .endTime(LocalTime.of(6, 0))
                                .build();

                                        WorkShift earlyMorningShift = WorkShift.builder()
                                                .id(302)
                                                .status("ACTIVE")
                                                .shiftName("Ca sang")
                                                .startTime(LocalTime.of(5, 0))
                                                .endTime(LocalTime.of(13, 0))
                                .build();

                                        WorkShiftAssignment nextDayExisting = WorkShiftAssignment.builder()
                                                .id(3001)
                                                .user(user)
                                                .workShift(earlyMorningShift)
                                                .shiftDate(shiftDate.plusDays(1))
                                                .deleted(false)
                                .build();

                                        ShiftAssignmentRequest request = ShiftAssignmentRequest.builder()
                                                .workShiftId(301)
                                                .userId(12)
                                                .shiftDate(shiftDate)
                                                .notes("overnight overlap")
                                .build();

                                when(workShiftRepository.findById(301)).thenReturn(Optional.of(overnightShift));
                        when(userRepository.findById(12)).thenReturn(Optional.of(user));
                                when(assignmentRepository.existsByWorkShiftIdAndUserIdAndShiftDateAndDeletedFalse(301, 12, shiftDate))
                                        .thenReturn(false);
                                when(assignmentRepositor
                               y.findByUserIdAndShiftDateBetweenAndDeletedFalse(12, shiftDate.minusDays(1),
                                shiftDate.plusDays(1)))
                                        .thenReturn(List.of(nextDayExisting));

                        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.createAssignment(request));

                    assertTrue(ex.getMessage().contains("Không thể phân ca bị overlap"));
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
                        when(assignmentRepository.existsByWorkShiftIdAndUserIdAndShiftDateAndDeletedFalse(201, 11, s
                               hiftDate))
                                                .thenReturn(false);
                        when(assignmentRepository.findByUserIdAndShiftDateBetweenAndDeletedFalse(11, shiftDate.minusDays(1),
                                                shiftDate.plusDays(1)))
                                                    .thenReturn(List.of(existing));
                when                    (assignmentRepository.save(any(WorkShiftAssignment.class)))
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

                        @Test
                void deleteAssignment_shouldThrow_whenAttendanceAlreadyHasCheckin() {
                                LocalDate shiftDate = LocalDate.of(2026, 3, 20);
                                User user = User.builder().id(55).build();
                                WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                                                .id(555)
                                                .user(user)
                                                .shiftDate(shiftDate)
                                                .status("ASSIGNED")
                                        .createdAt(LocalDateTime.now().minusMinutes(20))
                                                .deleted(false)
                                                .build();
                                Attendance attendance = Attendance.builder()
                                                .id(777)
                                                .user(user)
                                                .date(shiftDate)
                                .timeIn(LocalTime.of(8, 5))
                                        .status("PENDING")
                                        .build();

                        when(assignmentRepository.findById(555)).thenReturn(Optional.of(assignment));
                        when(attendanceRepository.findByUserIdAndDate(55, shiftDate)).thenReturn(Optional.of(attendance));

                            RuntimeException ex = assertThrows(RuntimeException.class, () -> service.deleteAssignment(555));
                assertEquals("Không thể xóa ca đã có dữ liệu chấm công", ex.getMessage());
                    verify(assignmentRepository, never()).save(any(WorkShiftAssignment.class));
            }

                        @Test
                void deleteAssignment_shouldSoftDelete_whenNoAttendanceData() {
                                LocalDate shiftDate = LocalDate.of(2026, 3, 21);
                                User user = User.builder().id(56).build();
                                WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                                                .id(556)
                                                .user(user)
                                                .shiftDate(shiftDate)
                                                .status("ASSIGNED")
                                .createdAt(LocalDateTime.now().minusMinutes(20))
                                        .deleted(false)
                                        .build();

                        when(assignmentRepository.findById(556)).thenReturn(Optional.of(assignment));
                when(attendanceRepository.findByUserIdAndDate(56, shiftDate)).thenReturn(Optional.empty());

                                service.deleteAssignment(556);

                    assertTrue(assignment.isDeleted());
                    verify(assignmentRepository).save(assignment);
            }

                        @Test
                void deleteAssignment_shouldThrow_whenStatusChangedAndNotRecent() {
                                LocalDate shiftDate = LocalDate.of(2026, 3, 22);
                                User user = User.builder().id(57).build();
                                WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                                                .id(557)
                                                .user(user)
                                                .shiftDate(shiftDate)
                                                .status("IN_PROGRESS")
                                .createdAt(LocalDateTime.now().minusMinutes(30))
                                        .deleted(false)
                                .build();

                        when(assignmentRepository.findById(557)).thenReturn(Optional.of(assignment));

                                RuntimeException ex = assertThrows(RuntimeException.class, () -> service.deleteAssignment(557));

                    assertEquals("Không thể xóa ca đã chuyển trạng thái", ex.getMessage());
                    verify(assignmentRepository, never()).save(any(WorkShiftAssignment.class));
            }

                        @Test
                void deleteAssignment_shouldAllow_whenRecentlyAssignedWithin10Minutes() {
                                LocalDate shiftDate = LocalDate.of(2026, 3, 23);
                                User user = User.builder().id(58).build();
                                WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                                                .id(558)
                                                .user(user)
                                                .shiftDate(shiftDate)
                                                .status("IN_PROGRESS")
                                .createdAt(LocalDateTime.now().minusMinutes(5))
                                        .deleted(false)
                                        .build();

                        when(assignmentRepository.findById(558)).thenReturn(Optional.of(assignment));
                when(attendanceRepository.findByUserIdAndDate(58, shiftDate)).thenReturn(Optional.empty());

                                service.deleteAssignment(558);

                    assertTrue(assignment.isDeleted());
                                service.deleteAssignment(558);

                    assertTrue(assignment.isDeleted());
                                service.deleteAssignment(558);

                    assertTrue(assignment.isDeleted());
                                service.deleteAssignment(558);

                    assertTrue(assignment.isDeleted());
                verify(assignmentRepository).save(assignment);
        }
}
