package com.smalltrend.repository;

import com.smalltrend.entity.UnitConversion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitConversionRepository extends JpaRepository<UnitConversion, Integer> {

    List<UnitConversion> findByVariantId(Integer variantId);

    Optional<UnitConversion> findByVariantIdAndToUnitId(Integer variantId, Integer toUnitId);

    boolean existsByVariantIdAndToUnitId(Integer variantId, Integer toUnitId);

    boolean existsByVariantIdAndToUnitIdAndIdNot(Integer variantId, Integer toUnitId, Integer id);

    boolean existsByToUnitId(Integer toUnitId);

    void deleteByVariantId(Integer variantId);

    @org.springframework.data.jpa.repository.Query("SELECT uc FROM UnitConversion uc WHERE uc.variant.product.id = :productId AND uc.toUnit.id = :toUnitId")
    List<UnitConversion> findByProductIdAndToUnitId(
            @org.springframework.data.repository.query.Param("productId") Integer productId,
            @org.springframework.data.repository.query.Param("toUnitId") Integer toUnitId);
}
