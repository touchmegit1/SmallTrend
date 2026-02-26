package com.smalltrend.repository;

import com.smalltrend.entity.WorkShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkShiftRepository extends JpaRepository<WorkShift, Integer> {

    boolean existsByShiftCodeIgnoreCase(String shiftCode);

    boolean existsByShiftCodeIgnoreCaseAndIdNot(String shiftCode, Integer id);

    List<WorkShift> findByShiftNameContainingIgnoreCaseOrShiftCodeContainingIgnoreCase(
            String shiftName,
            String shiftCode);

    List<WorkShift> findByStatusIgnoreCase(String status);
}
