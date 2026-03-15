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
            WHERE vp.status = :status
              AND vp.expiryDate = :targetDate
            """)
    List<VariantPrice> findByStatusAndExpiryDateWithVariant(
            @Param("status") VariantPriceStatus status,
            @Param("targetDate") LocalDate targetDate);
}
