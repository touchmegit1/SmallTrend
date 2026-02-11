package com.smalltrend.repository;

import com.smalltrend.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {

    List<PurchaseOrder> findBySupplierId(Integer supplierId);

    List<PurchaseOrder> findByStatus(String status);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.orderDate BETWEEN :startDate AND :endDate")
    List<PurchaseOrder> findByOrderDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.contract.id = :contractId")
    List<PurchaseOrder> findByContractId(@Param("contractId") Long contractId);
}
