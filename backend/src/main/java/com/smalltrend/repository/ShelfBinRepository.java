package com.smalltrend.repository;

import com.smalltrend.entity.ShelfBin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShelfBinRepository extends JpaRepository<ShelfBin, Long> {
}
