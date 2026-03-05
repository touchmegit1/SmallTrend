package com.smalltrend.repository;

import com.smalltrend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Integer orderId);

    @Query(value = """
        SELECT oi.product_name, SUM(oi.quantity), SUM(oi.line_total_amount)
        FROM sale_order_items oi
        JOIN sale_orders o ON oi.sale_order_id = o.id
        WHERE o.order_date BETWEEN :start AND :end
        AND o.status = 'COMPLETED'
        GROUP BY oi.product_name
        ORDER BY SUM(oi.quantity) DESC
        LIMIT :lim
        """, nativeQuery = true)
    List<Object[]> findTopSellingProducts(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("lim") int lim
    );

    @Query(value = """
        SELECT oi.product_name, SUM(oi.quantity), SUM(oi.line_total_amount)
        FROM sale_order_items oi
        JOIN sale_orders o ON oi.sale_order_id = o.id
        WHERE o.order_date BETWEEN :start AND :end
        AND o.status = 'COMPLETED'
        GROUP BY oi.product_name
        ORDER BY SUM(oi.quantity) ASC
        LIMIT :lim
        """, nativeQuery = true)
    List<Object[]> findBottomSellingProducts(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("lim") int lim
    );
}
