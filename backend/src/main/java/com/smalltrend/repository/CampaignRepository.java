package com.smalltrend.repository;

import com.smalltrend.entity.Campaign;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Integer> {
    List<Campaign> findByStatusOrderByStartDateDesc(String status);
    List<Campaign> findByStatusOrderByIsHomepageBannerDescStartDateDesc(String status);
    Optional<Campaign> findFirstByStatusAndIsHomepageBannerTrueOrderByStartDateDesc(String status);

    @Modifying
    @Query("UPDATE Campaign c SET c.isHomepageBanner = false WHERE c.isHomepageBanner = true AND (:excludeId IS NULL OR c.id <> :excludeId)")
    int clearHomepageBannerFlag(@Param("excludeId") Integer excludeId);

    List<Campaign> findAllByOrderByStartDateDesc();
}
