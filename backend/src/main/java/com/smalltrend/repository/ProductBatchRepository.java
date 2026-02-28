package com.smalltrend.repository;

import com.smalltrend.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, Integer> {

       @Query("SELECT DISTINCT pb FROM ProductBatch pb " +
                     "LEFT JOIN FETCH pb.variant v " +
                     "LEFT JOIN FETCH v.product")
       List<ProductBatch> findAllWithDetails();

       @Query("SELECT pb FROM ProductBatch pb " +
                     "WHERE pb.expiryDate < :today " +
                     "AND EXISTS (SELECT 1 FROM InventoryStock s WHERE s.batch = pb AND s.quantity > 0)")
       List<ProductBatch> findExpiredBatches(@Param("today") LocalDate today);

       @Query("SELECT pb FROM ProductBatch pb " +
                     "WHERE pb.expiryDate BETWEEN :today AND :futureDate " +
                     "AND EXISTS (SELECT 1 FROM InventoryStock s WHERE s.batch = pb AND s.quantity > 0)")
       List<ProductBatch> findExpiringSoonBatches(@Param("today") LocalDate today,
                     @Param("futureDate") LocalDate futureDate);

       List<ProductBatch> findByVariantId(Integer variantId);
}
