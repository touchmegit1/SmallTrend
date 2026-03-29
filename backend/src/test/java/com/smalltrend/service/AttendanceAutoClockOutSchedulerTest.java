package com.smalltrend.service;

import com.smalltrend.entity.Attendance;
import com.smalltrend.entity.User;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.entity.WorkShiftAssignment;
import com.smalltrend.repository.AttendanceRepository;
import com.smalltrend.repository.WorkShiftAssignmentRepository;
import com.smalltrend.service.shift.AttendanceAutoClockOutScheduler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceAutoClockOutSchedulerTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private WorkShiftAssignmentRepository assignmentRepository;

    private AttendanceAutoClockOutScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new AttendanceAutoClockOutScheduler(attendanceRepository, assignmentRepository);
    }

    @Test
    void autoClockOut_shouldSetTimeOutAndPresent_whenShiftEndedAndNoTimeOut() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        User user = User.builder().id(1).fullName("Test User").build();

        WorkShift shift = WorkShift.builder()
                .id(10)
                .shiftName("Ca sáng")
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .gracePeroidMinutes(10)
                .build();

        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(100)
                .user(user)
                .workShift(shift)
                .shiftDate(yesterday)
                .status("ASSIGNED")
                .build();

        Attendance attendance = Attendance.builder()
                .id(200)
                .user(user)
                .date(yesterday)
                .timeIn(LocalTime.of(8, 5))
                .timeOut(null)
                .status("PENDING")
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.findByUserIdAndDate(1, yesterday))
                .thenReturn(Optional.of(attendance));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));
        when(assignmentRepository.save(any(WorkShiftAssignment.class))).thenAnswer(inv -> inv.getArgument(0));

        scheduler.autoClockOutMissingCheckouts();

        ArgumentCaptor<Attendance> attendanceCaptor = ArgumentCaptor.forClass(Attendance.class);
        verify(attendanceRepository).save(attendanceCaptor.capture());
        Attendance saved = attendanceCaptor.getValue();

        assertNotNull(saved.getTimeOut());
        assertEquals(LocalTime.of(17, 0), saved.getTimeOut());
        assertEquals("PRESENT", saved.getStatus());

        ArgumentCaptor<WorkShiftAssignment> assignmentCaptor = ArgumentCaptor.forClass(WorkShiftAssignment.class);
        verify(assignmentRepository).save(assignmentCaptor.capture());
        assertEquals("COMPLETED", assignmentCaptor.getValue().getStatus());
    }

    @Test
    void autoClockOut_shouldMarkLate_whenCheckInAfterGracePeriod() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        User user = User.builder().id(2).fullName("Late User").build();

        WorkShift shift = WorkShift.builder()
                .id(11)
                .shiftName("Ca chiều")
                .startTime(LocalTime.of(13, 0))
                .endTime(LocalTime.of(22, 0))
                .gracePeroidMinutes(5)
                .build();

        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(101)
                .user(user)
                .workShift(shift)
                .shiftDate(yesterday)
                .status("ASSIGNED")
                .build();

        Attendance attendance = Attendance.builder()
                .id(201)
                .user(user)
                .date(yesterday)
                .timeIn(LocalTime.of(13, 20)) // 20 min late, grace=5
                .timeOut(null)
                .status("PENDING")
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.findByUserIdAndDate(2, yesterday))
                .thenReturn(Optional.of(attendance));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));
        when(assignmentRepository.save(any(WorkShiftAssignment.class))).thenAnswer(inv -> inv.getArgument(0));

        scheduler.autoClockOutMissingCheckouts();

        ArgumentCaptor<Attendance> captor = ArgumentCaptor.forClass(Attendance.class);
        verify(attendanceRepository).save(captor.capture());
        assertEquals("LATE", captor.getValue().getStatus());
        assertEquals(LocalTime.of(22, 0), captor.getValue().getTimeOut());
    }

    @Test
    void autoClockOut_shouldSkip_whenAttendanceAlreadyHasTimeOut() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        User user = User.builder().id(3).fullName("Already Out").build();

        WorkShift shift = WorkShift.builder()
                .id(12)
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .build();

        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(102)
                .user(user)
                .workShift(shift)
                .shiftDate(yesterday)
                .build();

        Attendance attendance = Attendance.builder()
                .id(202)
                .user(user)
                .date(yesterday)
                .timeIn(LocalTime.of(8, 0))
                .timeOut(LocalTime.of(17, 0)) // already has timeOut
                .status("PRESENT")
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.findByUserIdAndDate(3, yesterday))
                .thenReturn(Optional.of(attendance));

        scheduler.autoClockOutMissingCheckouts();

        verify(attendanceRepository, never()).save(any());
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void autoClockOut_shouldSkip_whenNoAttendanceRecord() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        User user = User.builder().id(4).fullName("No Attendance").build();

        WorkShift shift = WorkShift.builder()
                .id(13)
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .build();

        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(103)
                .user(user)
                .workShift(shift)
                .shiftDate(yesterday)
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.findByUserIdAndDate(4, yesterday))
                .thenReturn(Optional.empty());

        scheduler.autoClockOutMissingCheckouts();

        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void autoClockOut_shouldSkip_whenNoTimeIn() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        User user = User.builder().id(5).fullName("No CheckIn").build();

        WorkShift shift = WorkShift.builder()
                .id(14)
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(17, 0))
                .build();

        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(104)
                .user(user)
                .workShift(shift)
                .shiftDate(yesterday)
                .build();

        Attendance attendance = Attendance.builder()
                .id(204)
                .user(user)
                .date(yesterday)
                .timeIn(null) // no check-in
                .timeOut(null)
                .status("PENDING")
                .build();

        when(assignmentRepository.findByShiftDateBetweenAndDeletedFalse(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(assignment));
        when(attendanceRepository.findByUserIdAndDate(5, yesterday))
                .thenReturn(Optional.of(attendance));

        scheduler.autoClockOutMissingCheckouts();

        verify(attendanceRepository, never()).save(any());
    }
}
