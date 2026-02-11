package com.smalltrend.repository;

import com.smalltrend.entity.BulkPricingRule;
import com.smalltrend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BulkPricingRuleRepository extends JpaRepository<BulkPricingRule, Long> {
    List<BulkPricingRule> findByActiveTrueAndStartAtLessThanEqualAndEndAtGreaterThanEqual(LocalDateTime start, LocalDateTime end);
    List<BulkPricingRule> findByProductVariantAndActiveTrue(ProductVariant productVariant);
}
