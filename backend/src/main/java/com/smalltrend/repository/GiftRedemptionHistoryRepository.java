package com.smalltrend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smalltrend.entity.GiftRedemptionHistory;
import java.util.List;

@Repository
public interface GiftRedemptionHistoryRepository extends JpaRepository<GiftRedemptionHistory, Integer> {
    List<GiftRedemptionHistory> findByCustomerIdOrderByRedeemedAtDesc(Integer customerId);
}
