package com.smalltrend.repository;

import com.smalltrend.entity.SupplierContract;
import com.smalltrend.entity.enums.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierContractRepository extends JpaRepository<SupplierContract, Long> {

    List<SupplierContract> findBySupplierId(Integer supplierId);

    List<SupplierContract> findByStatus(ContractStatus status);

    Optional<SupplierContract> findByContractNumber(String contractNumber);

    @Query("SELECT sc FROM SupplierContract sc WHERE sc.status = :status AND sc.endDate < :currentDate")
    List<SupplierContract> findExpiredContracts(@Param("status") ContractStatus status, @Param("currentDate") LocalDate currentDate);

    @Query("SELECT sc FROM SupplierContract sc WHERE sc.status = 'ACTIVE' AND sc.startDate <= :currentDate AND sc.endDate >= :currentDate")
    List<SupplierContract> findActiveContracts(@Param("currentDate") LocalDate currentDate);
}
