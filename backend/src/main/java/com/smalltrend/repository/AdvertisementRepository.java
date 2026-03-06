package com.smalltrend.repository;

import com.smalltrend.entity.Advertisement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {
    List<Advertisement> findAllByOrderBySlotAscCreatedAtDesc();
    Optional<Advertisement> findBySlotAndIsActiveTrue(String slot);
    List<Advertisement> findByIsActiveTrue();
}
