package com.smalltrend.repository;

import com.smalltrend.entity.SupplierProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierProfileRepository extends JpaRepository<SupplierProfile, Long> {
    SupplierProfile findBySupplierId(Long supplierId);
}
