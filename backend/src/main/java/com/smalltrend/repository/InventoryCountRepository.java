package com.smalltrend.repository;

import com.smalltrend.entity.InventoryCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryCountRepository extends JpaRepository<InventoryCount, Integer> {
    Optional<InventoryCount> findTopByOrderByIdDesc();
    Optional<InventoryCount> findByCode(String code);
}
