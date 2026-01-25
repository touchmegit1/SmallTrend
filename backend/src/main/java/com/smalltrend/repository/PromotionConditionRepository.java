package com.smalltrend.repository;

import com.smalltrend.entity.PromotionCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionConditionRepository extends JpaRepository<PromotionCondition, Long> {
}
