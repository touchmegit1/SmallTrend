package com.smalltrend.repository;

import com.smalltrend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    Optional<ProductVariant> findBySku(String sku);

    Optional<ProductVariant> findByBarcode(String barcode);

    List<ProductVariant> findBySkuContainingIgnoreCase(String sku);

    List<ProductVariant> findByProductId(Integer productId);

    Optional<ProductVariant> findByProductIdAndIsBaseUnitTrue(Integer productId);

    List<ProductVariant> findByProductIdAndUnitId(Integer productId, Integer unitId);

    boolean existsBySku(String sku);

    boolean existsByBarcode(String barcode);

    boolean existsBySkuAndIdNot(String sku, Integer id);

    boolean existsByBarcodeAndIdNot(String barcode, Integer id);

    long countByUnitId(Integer unitId);

    // Search variants by SKU or product name (case-insensitive)
    @Query("SELECT pv FROM ProductVariant pv " +
           "LEFT JOIN pv.product p " +
           "WHERE LOWER(pv.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<ProductVariant> searchByKeyword(@Param("keyword") String keyword);
}
