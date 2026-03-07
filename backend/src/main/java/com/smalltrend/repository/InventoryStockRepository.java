package com.smalltrend.repository;

import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Location;
import com.smalltrend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    Optional<InventoryStock> findByBatchAndLocation(com.smalltrend.entity.ProductBatch batch, Location location);

    // Tìm tất cả stock records tại một location
    @Query("SELECT i FROM InventoryStock i JOIN FETCH i.variant v JOIN FETCH v.product WHERE i.location.id = :locationId AND i.quantity > 0")
    List<InventoryStock> findByLocationIdWithProduct(@Param("locationId") Integer locationId);
}

