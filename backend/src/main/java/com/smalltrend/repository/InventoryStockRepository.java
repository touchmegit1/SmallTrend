package com.smalltrend.repository;

import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Location;
import com.smalltrend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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

    // Tìm stock của variant tại một location cụ thể (dùng cho DisposalVoucherService)
    Optional<InventoryStock> findByVariantAndLocation(ProductVariant variant, Location location);

    @Query("SELECT i FROM InventoryStock i WHERE i.location.id = :locationId")
    List<InventoryStock> findByLocationIdWithProduct(@Param("locationId") Integer locationId);

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
}
