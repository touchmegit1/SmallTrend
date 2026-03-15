package com.smalltrend.repository;

import com.smalltrend.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

       @Query("SELECT DISTINCT pb FROM ProductBatch pb " +
                     "JOIN FETCH pb.variant v " +
                     "JOIN FETCH v.product " +
                     "JOIN FETCH pb.inventoryStocks s " +
                     "WHERE pb.expiryDate < :today " +
                     "AND s.quantity > 0 " +
                     "AND (:locationId IS NULL OR s.location.id = :locationId)")
       List<ProductBatch> findExpiredBatchesWithStockByLocation(@Param("today") LocalDate today,
                     @Param("locationId") Integer locationId);

       @Query("SELECT pb FROM ProductBatch pb " +
                     "WHERE pb.expiryDate BETWEEN :today AND :futureDate " +
                     "AND EXISTS (SELECT 1 FROM InventoryStock s WHERE s.batch = pb AND s.quantity > 0)")
       List<ProductBatch> findExpiringSoonBatches(@Param("today") LocalDate today,
                     @Param("futureDate") LocalDate futureDate);

       List<ProductBatch> findByVariantId(Integer variantId);

       Optional<ProductBatch> findFirstByVariantIdOrderByIdDesc(Integer variantId);
}
