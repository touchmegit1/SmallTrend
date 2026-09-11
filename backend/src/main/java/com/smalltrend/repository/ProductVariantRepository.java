package com.smalltrend.repository;

import com.smalltrend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {

    Optional<ProductVariant> findBySku(String sku);

    Optional<ProductVariant> findByBarcode(String barcode);

    List<ProductVariant> findBySkuContainingIgnoreCase(String sku);

    List<ProductVariant> findBySkuContainingIgnoreCaseOrProduct_NameContainingIgnoreCase(String sku, String productName);

    List<ProductVariant> findByProductId(Integer productId);

    Optional<ProductVariant> findByProductIdAndIsBaseUnitTrue(Integer productId);

    List<ProductVariant> findByProductIdAndUnitId(Integer productId, Integer unitId);

    boolean existsBySku(String sku);

    boolean existsByBarcode(String barcode);

    boolean existsBySkuAndIdNot(String sku, Integer id);

    boolean existsByBarcodeAndIdNot(String barcode, Integer id);

    long countByUnitId(Integer unitId);

    // Tìm biến thể theo SKU hoặc tên sản phẩm (không phân biệt hoa thường).
    @Query("SELECT pv FROM ProductVariant pv "
            + "LEFT JOIN pv.product p "
            + "WHERE LOWER(pv.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<ProductVariant> searchByKeyword(@Param("keyword") String keyword);

    @Query(value = "SELECT pv.id AS id, "
            + "COALESCE(p.name, '') AS productName, "
            + "COALESCE(u.name, '') AS unitName, "
            + "pv.sku AS sku, "
            + "pv.barcode AS barcode, "
            + "pv.plu_code AS pluCode, "
            + "pv.sell_price AS sellPrice, "
            + "pv.is_active AS isActive, "
            + "pv.image_url AS imageUrl, "
            + "COALESCE(p.is_active, 1) AS productActive, "
            + "COALESCE(SUM(s.quantity), 0) AS stockQuantity "
            + "FROM product_variants pv "
            + "LEFT JOIN products p ON p.id = pv.product_id "
            + "LEFT JOIN units u ON u.id = pv.unit_id "
            + "LEFT JOIN inventory_stock s ON s.variant_id = pv.id "
            + "GROUP BY pv.id, p.name, u.name, pv.sku, pv.barcode, pv.plu_code, pv.sell_price, pv.is_active, pv.image_url, p.is_active",
            nativeQuery = true)
    List<Map<String, Object>> findVariantSummariesNative();
}
