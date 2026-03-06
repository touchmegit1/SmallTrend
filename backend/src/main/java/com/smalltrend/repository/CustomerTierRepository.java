package com.smalltrend.repository;

import com.smalltrend.entity.CustomerTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerTierRepository extends JpaRepository<CustomerTier, Integer> {
    List<CustomerTier> findAllByOrderByPriorityAsc();
}
