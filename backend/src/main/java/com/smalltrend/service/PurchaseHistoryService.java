package com.smalltrend.service;

import com.smalltrend.dto.pos.SavePurchaseHistoryRequest;
import com.smalltrend.entity.PurchaseHistory;
import com.smalltrend.repository.PurchaseHistoryRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.service.inventory.InventoryStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseHistoryService {

    private final PurchaseHistoryRepository purchaseHistoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryStockService inventoryStockService;

    @Transactional
    public void savePurchaseHistory(SavePurchaseHistoryRequest request) {
        List<PurchaseHistory> histories = new ArrayList<>();

        for (SavePurchaseHistoryRequest.PurchaseItem item : request.getItems()) {
            // Note: If item is a combo, productId might be null or formatted differently depending on frontend.
            // Currently POS sends numeric ID for products. Combos might not have a numeric ID if they are 'combo_1' etc.
            // But we will catch it if productId is null or invalid.
            PurchaseHistory history = PurchaseHistory.builder()
                    .customerId(request.getCustomerId())
                    .customerName(request.getCustomerName())
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .subtotal(item.getSubtotal())
                    .paymentMethod(request.getPaymentMethod())
                    .build();

            histories.add(history);
        }

        List<PurchaseHistory> savedHistories = purchaseHistoryRepository.saveAll(histories);

        for (PurchaseHistory history : savedHistories) {
            if (history.getProductId() != null) {
                productVariantRepository.findById(history.getProductId().intValue()).ifPresent(variant -> {
                    try {
                        inventoryStockService.deductStock(variant, history.getQuantity(), history.getId(), "POS_SALE");
                    } catch (Exception e) {
                        System.err.println("Warning: Could not deduct stock for product " + variant.getSku() + ": " + e.getMessage());
                        // If strict inventory is required, throw RuntimeException to rollback
                        // throw new RuntimeException(e);
                    }
                });
            }
        }
    }
}
