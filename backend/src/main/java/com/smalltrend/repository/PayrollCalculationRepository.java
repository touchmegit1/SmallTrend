package com.smalltrend.repository;

import com.smalltrend.entity.PayrollCalculation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollCalculationRepository extends JpaRepository<PayrollCalculation, Integer> {

    List<PayrollCalculation> findByPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(
            LocalDate startDate,
            LocalDate endDate);

    List<PayrollCalculation> findByUserIdAndPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(
            Integer userId,
            LocalDate startDate,
            LocalDate endDate);
}
