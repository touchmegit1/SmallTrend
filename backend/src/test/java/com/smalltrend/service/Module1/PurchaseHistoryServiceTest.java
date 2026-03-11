package com.smalltrend.service.Module1;


import com.smalltrend.dto.pos.SavePurchaseHistoryRequest;
import com.smalltrend.entity.PurchaseHistory;
import com.smalltrend.repository.PurchaseHistoryRepository;
import com.smalltrend.service.PurchaseHistoryService;

import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.service.inventory.InventoryStockService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PurchaseHistoryServiceTest {

    @Mock
    private PurchaseHistoryRepository purchaseHistoryRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private InventoryStockService inventoryStockService;

    private PurchaseHistoryService purchaseHistoryService;

    @Captor
    private ArgumentCaptor<List<PurchaseHistory>> historyListCaptor;

    @BeforeEach
    void setUp() {
        purchaseHistoryService = new PurchaseHistoryService(purchaseHistoryRepository, productVariantRepository, inventoryStockService);
    }

    @Test
    void savePurchaseHistory_shouldSaveAllItems() {
        SavePurchaseHistoryRequest.PurchaseItem item1 = new SavePurchaseHistoryRequest.PurchaseItem();
        item1.setProductId(101L);
        item1.setProductName("Product 1");
        item1.setQuantity(2);
        item1.setPrice(new BigDecimal("50000"));
        item1.setSubtotal(new BigDecimal("100000"));

        SavePurchaseHistoryRequest.PurchaseItem item2 = new SavePurchaseHistoryRequest.PurchaseItem();
        item2.setProductId(102L);
        item2.setProductName("Product 2");
        item2.setQuantity(1);
        item2.setPrice(new BigDecimal("150000"));
        item2.setSubtotal(new BigDecimal("150000"));

        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setCustomerId(1L);
        request.setCustomerName("VIP Customer");
        request.setPaymentMethod("CASH");
        request.setItems(List.of(item1, item2));

        when(purchaseHistoryRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        purchaseHistoryService.savePurchaseHistory(request);

        verify(purchaseHistoryRepository).saveAll(historyListCaptor.capture());
        List<PurchaseHistory> savedHistories = historyListCaptor.getValue();

        assertEquals(2, savedHistories.size());

        PurchaseHistory history1 = savedHistories.get(0);
        assertEquals(1, history1.getCustomerId());
        assertEquals("VIP Customer", history1.getCustomerName());
        assertEquals(101, history1.getProductId());
        assertEquals("Product 1", history1.getProductName());
        assertEquals(2, history1.getQuantity());
        assertEquals(new BigDecimal("50000"), history1.getPrice());
        assertEquals(new BigDecimal("100000"), history1.getSubtotal());
        assertEquals("CASH", history1.getPaymentMethod());

        PurchaseHistory history2 = savedHistories.get(1);
        assertEquals(102, history2.getProductId());
        assertEquals("Product 2", history2.getProductName());
        assertEquals(1, history2.getQuantity());
        assertEquals(new BigDecimal("150000"), history2.getPrice());
        assertEquals(new BigDecimal("150000"), history2.getSubtotal());
        assertEquals("CASH", history2.getPaymentMethod());
    }
}
