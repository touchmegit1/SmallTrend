package com.smalltrend.service.products;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class VariantPriceExpiryScheduler {

    private final VariantPriceService variantPriceService;

    @Scheduled(cron = "${app.notifications.price-expiry.auto-inactive-cron:0 */10 * * * *}")
    public void autoDeactivateExpiredVariantPrices() {
        int deactivatedCount = variantPriceService.deactivateExpiredActivePrices();
        if (deactivatedCount > 0) {
            log.info("Auto-deactivated {} expired active variant prices.", deactivatedCount);
        }
    }
}
