package com.smalltrend.repository;

import com.smalltrend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Integer id);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Integer id);
}
