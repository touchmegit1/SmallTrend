package com.smalltrend.repository;

import com.smalltrend.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Integer> {
    List<Campaign> findByStatusOrderByStartDateDesc(String status);
    List<Campaign> findAllByOrderByStartDateDesc();
}
