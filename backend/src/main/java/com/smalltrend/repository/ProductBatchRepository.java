package com.smalltrend.repository;

import com.smalltrend.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {
}
