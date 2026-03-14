package com.smalltrend.repository;

import com.smalltrend.entity.InventoryCountItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface InventoryCountItemRepository extends JpaRepository<InventoryCountItem, Integer> {
    List<InventoryCountItem> findByInventoryCountId(Integer inventoryCountId);

    @Modifying
    @Transactional
    void deleteByInventoryCountId(Integer inventoryCountId);
}
