package com.smalltrend.repository;

import com.smalltrend.entity.DisposalVoucherItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisposalVoucherItemRepository extends JpaRepository<DisposalVoucherItem, Long> {
}
