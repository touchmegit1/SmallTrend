package com.smalltrend.repository;

import com.smalltrend.entity.SalaryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryConfigRepository extends JpaRepository<SalaryConfig, Integer> {

    Optional<SalaryConfig> findByUserId(Integer userId);

    List<SalaryConfig> findByIsActiveTrue();

    @Query("SELECT sc FROM SalaryConfig sc WHERE sc.user.id = :userId AND sc.isActive = true AND sc.effectiveFrom <= :currentDate AND (sc.effectiveUntil IS NULL OR sc.effectiveUntil >= :currentDate)")
    Optional<SalaryConfig> findActiveConfigByUserId(@Param("userId") Integer userId, @Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT sc FROM SalaryConfig sc WHERE sc.effectiveUntil < :currentDate AND sc.isActive = true")
    List<SalaryConfig> findExpiredConfigs(@Param("currentDate") LocalDateTime currentDate);
}
