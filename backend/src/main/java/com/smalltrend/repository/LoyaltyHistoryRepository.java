package com.smalltrend.repository;

import com.smalltrend.entity.LoyaltyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoyaltyHistoryRepository extends JpaRepository<LoyaltyHistory, Long> {
}
