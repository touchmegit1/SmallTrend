package com.smalltrend.repository;

import com.smalltrend.entity.ProductCombo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductComboRepository extends JpaRepository<ProductCombo, Integer> {
    Optional<ProductCombo> findByComboCode(String comboCode);
}
