package com.smalltrend.repository;

import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Location;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {

    @Query("SELECT COUNT(i) FROM InventoryStock i WHERE i.quantity <= :threshold")
    Long countLowStockItems(@Param("threshold") int threshold);

    @Query("SELECT i FROM InventoryStock i WHERE i.quantity <= :threshold")
    List<InventoryStock> findLowStockItems(@Param("threshold") int threshold);

    // Tìm tất cả stock records của một variant (dùng variantId)
    @Query("SELECT i FROM InventoryStock i WHERE i.variant.id = :variantId")
    List<InventoryStock> findByVariantId(@Param("variantId") Integer variantId);

    // Tìm stock của variant tại một location cụ thể
    Optional<InventoryStock> findByVariantAndLocation(ProductVariant variant, Location location);

    // Tìm stock của lô cụ thể tại location
    Optional<InventoryStock> findByBatchAndLocation(ProductBatch batch, Location location);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM InventoryStock i WHERE i.batch = :batch AND i.location = :location")
    Optional<InventoryStock> findByBatchAndLocationForUpdate(@Param("batch") ProductBatch batch,
            @Param("location") Location location);

    // Tìm tất cả stock records tại một location
    @Query("SELECT i FROM InventoryStock i JOIN FETCH i.variant v JOIN FETCH v.product LEFT JOIN FETCH v.unit LEFT JOIN FETCH i.batch WHERE i.location.id = :locationId AND i.quantity > 0")
    List<InventoryStock> findByLocationIdWithProduct(@Param("locationId") Integer locationId);

    // Tổng tồn kho của một variant (tất cả batch + location)
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM InventoryStock i WHERE i.variant.id = :variantId")
    int sumQuantityByVariantId(@Param("variantId") Integer variantId);

    boolean existsByLocationIdAndQuantityGreaterThan(Integer locationId, Integer quantity);

    // Tìm stock cụ thể theo variant + batch + location
    Optional<InventoryStock> findByVariantIdAndBatchIdAndLocationId(Integer variantId, Integer batchId,
            Integer locationId);

    @Query(value = """
            SELECT p.name, pv.sku, SUM(i.quantity)
            FROM inventory_stock i
            JOIN product_variants pv ON i.variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            GROUP BY pv.id, p.name, pv.sku
            HAVING SUM(i.quantity) <= :threshold
            ORDER BY SUM(i.quantity) ASC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> findLowStockSummary(@Param("threshold") int threshold);

    @Query("SELECT i FROM InventoryStock i JOIN FETCH i.variant v JOIN FETCH v.product LEFT JOIN FETCH i.batch LEFT JOIN FETCH i.location WHERE COALESCE(i.quantity, 0) <= 0")
    List<InventoryStock> findOutOfStockWithDetails();
}
