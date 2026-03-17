package com.smalltrend.repository;

import com.smalltrend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Integer id);
}
