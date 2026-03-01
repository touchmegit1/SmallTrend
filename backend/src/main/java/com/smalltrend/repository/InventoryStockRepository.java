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

    // Tìm stock của variant tại một location cụ thể (dùng cho DisposalVoucherService)
    Optional<InventoryStock> findByVariantAndLocation(ProductVariant variant, Location location);
}

