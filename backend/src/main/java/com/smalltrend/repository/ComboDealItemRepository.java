package com.smalltrend.repository;

import com.smalltrend.entity.ComboDealItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboDealItemRepository extends JpaRepository<ComboDealItem, Long> {
}
