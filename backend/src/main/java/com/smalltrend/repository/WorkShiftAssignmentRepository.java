package com.smalltrend.repository;

import com.smalltrend.entity.WorkShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkShiftAssignmentRepository extends JpaRepository<WorkShiftAssignment, Integer> {

    boolean existsByWorkShiftIdAndUserIdAndShiftDate(Integer workShiftId, Integer userId, LocalDate shiftDate);

    List<WorkShiftAssignment> findByShiftDateBetween(LocalDate startDate, LocalDate endDate);

    List<WorkShiftAssignment> findByUserIdAndShiftDateBetween(Integer userId, LocalDate startDate, LocalDate endDate);
}
