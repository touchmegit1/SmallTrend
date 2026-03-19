package com.smalltrend.repository;

import com.smalltrend.entity.PayrollCalculation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollCalculationRepository extends JpaRepository<PayrollCalculation, Integer> {

    List<PayrollCalculation> findByPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(
            LocalDate startDate,
            LocalDate endDate);

    List<PayrollCalculation> findByUserIdAndPayPeriodStartGreaterThanEqualAndPayPeriodEndLessThanEqual(
            Integer userId,
            LocalDate startDate,
            LocalDate endDate);

    Optional<PayrollCalculation> findByUserIdAndPayPeriodStartAndPayPeriodEnd(
            Integer userId,
            LocalDate payPeriodStart,
            LocalDate payPeriodEnd);

        boolean existsByUserIdAndStatusNotIgnoreCase(Integer userId, String status);
}
