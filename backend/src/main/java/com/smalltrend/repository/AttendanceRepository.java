package com.smalltrend.repository;

import com.smalltrend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    Optional<Attendance> findByUserIdAndDate(Integer userId, LocalDate date);

    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<Attendance> findByUserIdAndDateBetween(Integer userId, LocalDate startDate, LocalDate endDate);
}
