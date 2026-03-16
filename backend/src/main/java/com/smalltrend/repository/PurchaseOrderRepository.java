package com.smalltrend.repository;

import com.smalltrend.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    boolean existsByLocationId(Integer locationId);
    
    List<PurchaseOrder> findBySupplierId(Integer supplierId);
    
    List<PurchaseOrder> findByStatus(com.smalltrend.entity.enums.PurchaseOrderStatus status);
    
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.orderDate BETWEEN :startDate AND :endDate")
    List<PurchaseOrder> findByOrderDateBetween(LocalDate startDate, LocalDate endDate);
}
