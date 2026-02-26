package com.smalltrend.repository;

import com.smalltrend.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);
}
