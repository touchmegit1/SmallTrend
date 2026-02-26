package com.smalltrend.repository;

import com.smalltrend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByStatusIgnoreCase(String status);

    List<Order> findByCashierId(Integer cashierId);

    List<Order> findByOrderDateBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
}
