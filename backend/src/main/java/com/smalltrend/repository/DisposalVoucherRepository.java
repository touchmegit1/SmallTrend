package com.smalltrend.repository;

import com.smalltrend.entity.DisposalVoucher;
import com.smalltrend.entity.enums.DisposalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DisposalVoucherRepository extends JpaRepository<DisposalVoucher, Long> {
    
    List<DisposalVoucher> findByStatus(DisposalStatus status);
    
    Optional<DisposalVoucher> findByCode(String code);
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(d.code, 11) AS int)), 0) FROM DisposalVoucher d WHERE d.code LIKE ?1%")
    Integer findMaxSequenceForDate(String prefix);
}
