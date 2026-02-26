package com.smalltrend.repository;

import com.smalltrend.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {

    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    long countByPoNumberStartingWith(String prefix);
}
