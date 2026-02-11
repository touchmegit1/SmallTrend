package com.smalltrend.repository;

import com.smalltrend.entity.ComboDeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboDealRepository extends JpaRepository<ComboDeal, Long> {
}
