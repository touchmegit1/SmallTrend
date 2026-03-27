package com.smalltrend.repository;

import com.smalltrend.entity.VariantPrice;
import com.smalltrend.entity.enums.VariantPriceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VariantPriceRepository extends JpaRepository<VariantPrice, Integer> {

    List<VariantPrice> findByVariantIdOrderByCreatedAtDesc(Integer variantId);

    List<VariantPrice> findByVariantIdAndStatus(Integer variantId, VariantPriceStatus status);

    Optional<VariantPrice> findFirstByVariantIdAndStatus(Integer variantId, VariantPriceStatus status);

    void deleteByVariantId(Integer variantId);

    @Query("""
            SELECT vp
            FROM VariantPrice vp
            JOIN FETCH vp.variant v
            JOIN FETCH v.product p
            LEFT JOIN FETCH v.unit u
            WHERE vp.status = :status
              AND vp.expiryDate IS NOT NULL
              AND vp.expiryDate BETWEEN :startDate AND :endDate
            """)
    List<VariantPrice> findByStatusAndExpiryDateRangeWithVariant(
            @Param("status") VariantPriceStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT vp
            FROM VariantPrice vp
            JOIN FETCH vp.variant v
            WHERE vp.status = :status
              AND vp.expiryDate IS NOT NULL
              AND vp.expiryDate < :today
            """)
    List<VariantPrice> findExpiredByStatusWithVariant(
            @Param("status") VariantPriceStatus status,
            @Param("today") LocalDate today);
}
