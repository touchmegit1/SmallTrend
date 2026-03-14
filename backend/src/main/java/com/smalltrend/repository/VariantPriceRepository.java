package com.smalltrend.repository;

import com.smalltrend.entity.VariantPrice;
import com.smalltrend.entity.enums.VariantPriceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VariantPriceRepository extends JpaRepository<VariantPrice, Integer> {

    List<VariantPrice> findByVariantIdOrderByCreatedAtDesc(Integer variantId);

    List<VariantPrice> findByVariantIdAndStatus(Integer variantId, VariantPriceStatus status);

    Optional<VariantPrice> findFirstByVariantIdAndStatus(Integer variantId, VariantPriceStatus status);

    void deleteByVariantId(Integer variantId);
}
