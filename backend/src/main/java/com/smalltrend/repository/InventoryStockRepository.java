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

    // Tổng tồn kho của một variant (tất cả batch + location)
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM InventoryStock i WHERE i.variant.id = :variantId")
    int sumQuantityByVariantId(@Param("variantId") Integer variantId);

    // Tìm stock cụ thể theo variant + batch + location
    Optional<InventoryStock> findByVariantIdAndBatchIdAndLocationId(Integer variantId, Integer batchId,
            Integer locationId);

    // Tổng hợp sản phẩm tồn kho thấp: trả về [tên sản phẩm, SKU, tổng số lượng]
    @Query("SELECT v.product.name, v.sku, COALESCE(SUM(i.quantity), 0) " +
           "FROM InventoryStock i JOIN i.variant v " +
           "GROUP BY v.id, v.product.name, v.sku " +
           "HAVING COALESCE(SUM(i.quantity), 0) <= :threshold " +
           "ORDER BY COALESCE(SUM(i.quantity), 0) ASC")
    List<Object[]> findLowStockSummary(@Param("threshold") int threshold);
}
