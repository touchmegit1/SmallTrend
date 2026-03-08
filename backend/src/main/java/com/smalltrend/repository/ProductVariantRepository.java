package com.smalltrend.repository;

import com.smalltrend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
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

    boolean existsBySku(String sku);

    boolean existsByBarcode(String barcode);

    boolean existsBySkuAndIdNot(String sku, Integer id);

    boolean existsByBarcodeAndIdNot(String barcode, Integer id);

    long countByUnitId(Integer unitId);
}
