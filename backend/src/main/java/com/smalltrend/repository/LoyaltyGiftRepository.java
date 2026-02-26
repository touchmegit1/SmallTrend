package com.smalltrend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smalltrend.entity.LoyaltyGift;
import java.util.List;

@Repository
public interface LoyaltyGiftRepository extends JpaRepository<LoyaltyGift, Integer> {
    List<LoyaltyGift> findByIsActiveTrue();
}
