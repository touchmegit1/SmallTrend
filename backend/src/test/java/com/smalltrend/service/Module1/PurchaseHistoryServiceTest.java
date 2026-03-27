package com.smalltrend.service.Module1;

import com.smalltrend.dto.pos.SavePurchaseHistoryRequest;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.PurchaseHistory;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.PurchaseHistoryRepository;
import com.smalltrend.service.PurchaseHistoryService;
import com.smalltrend.service.inventory.shared.InventoryStockService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseHistoryServiceTest {

    @Mock
    private PurchaseHistoryRepository purchaseHistoryRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private InventoryStockService inventoryStockService;

    @InjectMocks
    private PurchaseHistoryService purchaseHistoryService;

    @Captor
    private ArgumentCaptor<List<PurchaseHistory>> historyListCaptor;

    @Test
    void savePurchaseHistory_shouldSaveEmptyListAndReturn_whenItemsIsNull() {
        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setItems(null);

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of());

        purchaseHistoryService.savePurchaseHistory(request);

        verify(purchaseHistoryRepository).saveAll(historyListCaptor.capture());
        assertEquals(0, historyListCaptor.getValue().size());
        verify(productVariantRepository, never()).findById(anyInt());
        verify(inventoryStockService, never()).deductStock(any(), anyInt(), anyLong(), anyString());
    }

    @Test
    void savePurchaseHistory_shouldSaveEmptyList_whenItemsIsEmpty() {
        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setItems(List.of());

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of());

        purchaseHistoryService.savePurchaseHistory(request);

        verify(purchaseHistoryRepository).saveAll(historyListCaptor.capture());
        assertEquals(0, historyListCaptor.getValue().size());
        verify(productVariantRepository, never()).findById(anyInt());
        verify(inventoryStockService, never()).deductStock(any(), anyInt(), anyLong(), anyString());
    }

    @Test
    void savePurchaseHistory_shouldMapAndSaveItems_thenDeductStock_whenVariantFound() {
        SavePurchaseHistoryRequest.PurchaseItem item = new SavePurchaseHistoryRequest.PurchaseItem();
        item.setProductId(101L);
        item.setProductName("Product 1");
        item.setQuantity(2);
        item.setPrice(new BigDecimal("50000"));
        item.setSubtotal(new BigDecimal("100000"));

        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setCustomerId(1L);
        request.setCustomerName("VIP Customer");
        request.setPaymentMethod("CASH");
        request.setItems(List.of(item));

        PurchaseHistory savedHistory = PurchaseHistory.builder()
                .id(1L)
                .productId(101L)
                .quantity(2)
                .build();

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of(savedHistory));

        ProductVariant variant = new ProductVariant();
        variant.setSku("SKU-101");
        when(productVariantRepository.findById(101)).thenReturn(Optional.of(variant));

        purchaseHistoryService.savePurchaseHistory(request);

        verify(purchaseHistoryRepository).saveAll(historyListCaptor.capture());
        List<PurchaseHistory> captured = historyListCaptor.getValue();
        assertEquals(1, captured.size());
        assertEquals(1L, captured.get(0).getCustomerId());
        assertEquals("VIP Customer", captured.get(0).getCustomerName());
        assertEquals("CASH", captured.get(0).getPaymentMethod());
        assertEquals(101L, captured.get(0).getProductId());
        assertEquals("Product 1", captured.get(0).getProductName());
        assertEquals(2, captured.get(0).getQuantity());
        assertEquals(new BigDecimal("50000"), captured.get(0).getPrice());
        assertEquals(new BigDecimal("100000"), captured.get(0).getSubtotal());

        verify(productVariantRepository).findById(101);
        verify(inventoryStockService).deductStock(variant, 2, 1L, "POS_SALE");
    }

    @Test
    void savePurchaseHistory_shouldSkipDeductStock_whenVariantNotFound() {
        SavePurchaseHistoryRequest.PurchaseItem item = new SavePurchaseHistoryRequest.PurchaseItem();
        item.setProductId(202L);
        item.setQuantity(3);

        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setItems(List.of(item));

        PurchaseHistory savedHistory = PurchaseHistory.builder()
                .id(10L)
                .productId(202L)
                .quantity(3)
                .build();

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of(savedHistory));
        when(productVariantRepository.findById(202)).thenReturn(Optional.empty());

        purchaseHistoryService.savePurchaseHistory(request);

        verify(productVariantRepository).findById(202);
        verify(inventoryStockService, never()).deductStock(any(), anyInt(), anyLong(), anyString());
    }

    @Test
    void savePurchaseHistory_shouldCatchException_whenDeductStockFails() {
        SavePurchaseHistoryRequest.PurchaseItem item = new SavePurchaseHistoryRequest.PurchaseItem();
        item.setProductId(103L);
        item.setQuantity(5);

        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setItems(List.of(item));

        PurchaseHistory savedHistory = PurchaseHistory.builder()
                .id(3L)
                .productId(103L)
                .quantity(5)
                .build();

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of(savedHistory));

        ProductVariant variant = new ProductVariant();
        when(productVariantRepository.findById(103)).thenReturn(Optional.of(variant));

        doThrow(new RuntimeException("Out of stock")).when(inventoryStockService)
                .deductStock(variant, 5, 3L, "POS_SALE");

        purchaseHistoryService.savePurchaseHistory(request);

        verify(inventoryStockService).deductStock(variant, 5, 3L, "POS_SALE");
    }

    @Test
    void savePurchaseHistory_shouldSkipVariantLookup_whenSavedHistoryProductIdIsNull() {
        SavePurchaseHistoryRequest.PurchaseItem item = new SavePurchaseHistoryRequest.PurchaseItem();
        item.setProductName("Combo Product");
        item.setQuantity(1);

        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setItems(List.of(item));

        PurchaseHistory savedHistory = PurchaseHistory.builder()
                .id(2L)
                .quantity(1)
                .productId(null)
                .build();

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of(savedHistory));

        purchaseHistoryService.savePurchaseHistory(request);

        verify(productVariantRepository, never()).findById(anyInt());
        verify(inventoryStockService, never()).deductStock(any(), anyInt(), anyLong(), anyString());
    }

    @Test
    void getCustomerHistory_shouldReturnRepositoryResult() {
        PurchaseHistory history = PurchaseHistory.builder().id(1L).customerId(88L).build();
        when(purchaseHistoryRepository.findByCustomerId(88L)).thenReturn(List.of(history));

        List<PurchaseHistory> result = purchaseHistoryService.getCustomerHistory(88L);

        assertEquals(1, result.size());
        assertEquals(88L, result.get(0).getCustomerId());
        verify(purchaseHistoryRepository).findByCustomerId(88L);
    }
}
