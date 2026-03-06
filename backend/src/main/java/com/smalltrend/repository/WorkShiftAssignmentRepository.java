package com.smalltrend.repository;

import com.smalltrend.entity.WorkShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkShiftAssignmentRepository extends JpaRepository<WorkShiftAssignment, Integer> {

    boolean existsByWorkShiftIdAndUserIdAndShiftDateAndDeletedFalse(Integer workShiftId, Integer userId, LocalDate shiftDate);

    Optional<WorkShiftAssignment> findByIdAndDeletedFalse(Integer id);

    List<WorkShiftAssignment> findByShiftDateBetweenAndDeletedFalse(LocalDate startDate, LocalDate endDate);

    List<WorkShiftAssignment> findByUserIdAndShiftDateBetweenAndDeletedFalse(Integer userId, LocalDate startDate, LocalDate endDate);

    boolean existsByUserIdAndWorkShiftIdAndShiftDateAndDeletedFalse(Integer userId, Integer workShiftId, LocalDate shiftDate);
}
