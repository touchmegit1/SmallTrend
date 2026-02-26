package com.smalltrend.repository;

import com.smalltrend.entity.InventoryStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, Integer> {
    List<InventoryStock> findByVariantId(Integer variantId);
}
