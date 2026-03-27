package com.smalltrend.service;

import com.smalltrend.dto.pos.SavePurchaseHistoryRequest;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.PurchaseHistory;
import com.smalltrend.repository.PurchaseHistoryRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.service.inventory.shared.InventoryStockService;
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
    // Lưu purchase history.
    public void savePurchaseHistory(SavePurchaseHistoryRequest request) {
        List<PurchaseHistory> histories = new ArrayList<>();

        if (request.getItems() == null) {
            purchaseHistoryRepository.saveAll(histories);
            return;
        }

        for (SavePurchaseHistoryRequest.PurchaseItem item : request.getItems()) {
            PurchaseHistory history = PurchaseHistory.builder()
                    .customerId(request.getCustomerId())
                    .customerName(request.getCustomerName())
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .subtotal(item.getSubtotal())
                    .paymentMethod(request.getPaymentMethod())
                    .voucherDiscountAmount(request.getVoucherDiscountAmount())
                    .build();

            histories.add(history);
        }

        List<PurchaseHistory> savedHistories = purchaseHistoryRepository.saveAll(histories);

        for (PurchaseHistory history : savedHistories) {
            if (history.getProductId() == null) {
                continue;
            }

            Integer variantId = history.getProductId().intValue();
            productVariantRepository.findById(variantId).ifPresent(variant -> deductStockQuietly(variant, history));
        }
    }

    // Lấy customer history.
    public List<PurchaseHistory> getCustomerHistory(Long customerId) {
        return purchaseHistoryRepository.findByCustomerId(customerId);
    }

    @Transactional
    // Hoàn purchase items.
    public void refundPurchaseItems(SavePurchaseHistoryRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Refund items are required");
        }

        for (SavePurchaseHistoryRequest.PurchaseItem item : request.getItems()) {
            if (item.getProductId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Invalid refund item data");
            }

            Integer variantId = item.getProductId().intValue();
            ProductVariant variant = productVariantRepository.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Variant not found: " + variantId));

            inventoryStockService.restockFromRefund(
                    variant,
                    item.getQuantity(),
                    null,
                    "POS refund from purchase history");
        }
    }

    // Xử lý deduct stock quietly.
    private void deductStockQuietly(ProductVariant variant, PurchaseHistory history) {
        try {
            inventoryStockService.deductStock(variant, history.getQuantity(), history.getId(), "POS_SALE");
        } catch (Exception ignored) {
            // Keep purchase history persistence resilient even when inventory deduction fails.
        }
    }
}
