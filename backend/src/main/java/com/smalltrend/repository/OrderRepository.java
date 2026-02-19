package com.smalltrend.repository;

import com.smalltrend.entity.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<SalesOrder, Integer> {
    @Query("SELECT SUM(o.totalAmount) FROM SalesOrder o WHERE o.orderDate BETWEEN :start AND :end")
    BigDecimal sumTotalRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM SalesOrder o WHERE o.orderDate BETWEEN :start AND :end")
    Long countOrders(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<SalesOrder> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
}
