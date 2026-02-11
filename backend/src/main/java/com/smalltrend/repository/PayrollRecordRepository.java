package com.smalltrend.repository;

import com.smalltrend.entity.PayrollRecord;
import com.smalltrend.entity.enums.PayrollStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {

    List<PayrollRecord> findByUserId(Integer userId);

    List<PayrollRecord> findByStatus(PayrollStatus status);

    @Query("SELECT pr FROM PayrollRecord pr WHERE pr.payPeriodStart = :startDate AND pr.payPeriodEnd = :endDate")
    List<PayrollRecord> findByPayPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT pr FROM PayrollRecord pr WHERE pr.user.id = :userId AND pr.payPeriodStart = :startDate AND pr.payPeriodEnd = :endDate")
    Optional<PayrollRecord> findByUserAndPayPeriod(@Param("userId") Integer userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT pr FROM PayrollRecord pr WHERE pr.paymentDate BETWEEN :startDate AND :endDate")
    List<PayrollRecord> findByPaymentDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
