package com.smalltrend.repository;

import com.smalltrend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByStatusIgnoreCase(String status);

    List<Order> findByCashierId(Integer cashierId);

    List<Order> findByOrderDateBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderDate BETWEEN :start AND :end")
    BigDecimal sumTotalRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate BETWEEN :start AND :end")
    Long countOrders(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
