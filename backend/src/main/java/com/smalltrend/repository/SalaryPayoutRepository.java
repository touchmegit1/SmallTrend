package com.smalltrend.repository;

import com.smalltrend.entity.SalaryPayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryPayoutRepository extends JpaRepository<SalaryPayout, Integer> {
}
