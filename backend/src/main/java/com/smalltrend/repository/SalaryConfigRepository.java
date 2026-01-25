package com.smalltrend.repository;

import com.smalltrend.entity.SalaryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryConfigRepository extends JpaRepository<SalaryConfig, Long> {
}
