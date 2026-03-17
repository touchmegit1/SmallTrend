package com.smalltrend.repository;

import com.smalltrend.entity.TaxRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxRateRepository extends JpaRepository<TaxRate, Integer> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Integer id);
}
