package com.smalltrend.repository;

import com.smalltrend.entity.PriceExpiryAlertLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface PriceExpiryAlertLogRepository extends JpaRepository<PriceExpiryAlertLog, Integer> {
    boolean existsByVariantPriceIdAndAlertDateAndRecipientEmail(Integer variantPriceId, LocalDate alertDate, String recipientEmail);
}
