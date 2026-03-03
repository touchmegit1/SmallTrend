package com.smalltrend.repository;

import com.smalltrend.entity.ProductComboItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductComboItemRepository extends JpaRepository<ProductComboItem, Integer> {
    List<ProductComboItem> findByComboId(Integer comboId);

    void deleteByComboId(Integer comboId);
}
