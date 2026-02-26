package com.smalltrend.repository;

import com.smalltrend.entity.InventoryCountItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryCountItemRepository extends JpaRepository<InventoryCountItem, Integer> {
    List<InventoryCountItem> findByInventoryCountId(Integer inventoryCountId);
    void deleteByInventoryCountId(Integer inventoryCountId);
}
