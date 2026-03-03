package com.smalltrend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smalltrend.entity.LoyaltyTransaction;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Integer> {
}
