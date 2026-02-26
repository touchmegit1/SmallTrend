package com.smalltrend.service;

import com.smalltrend.dto.pos.SavePurchaseHistoryRequest;
import com.smalltrend.entity.PurchaseHistory;
import com.smalltrend.repository.PurchaseHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseHistoryService {

    private final PurchaseHistoryRepository purchaseHistoryRepository;

    @Transactional
    public void savePurchaseHistory(SavePurchaseHistoryRequest request) {
        List<PurchaseHistory> histories = new ArrayList<>();

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
                    .build();

            histories.add(history);
        }

        purchaseHistoryRepository.saveAll(histories);
    }

    public List<PurchaseHistory> getCustomerHistory(Long customerId) {
        return purchaseHistoryRepository.findByCustomerId(customerId);
    }
}
