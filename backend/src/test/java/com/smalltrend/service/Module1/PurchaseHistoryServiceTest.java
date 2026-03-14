package com.smalltrend.service.Module1;

import com.smalltrend.dto.pos.SavePurchaseHistoryRequest;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.PurchaseHistory;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.PurchaseHistoryRepository;
import com.smalltrend.service.PurchaseHistoryService;
import com.smalltrend.service.inventory.InventoryStockService;
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

/**
 * Unit Test for PurchaseHistoryService
 * Coverage target: 100% Statement Coverage + 100% Decision Coverage
 *
 * savePurchaseHistory() — all decision branches:
 *
 *  Branch 1 (for-loop, items list empty): no items → saveAll called with empty list, inner loop body not entered
 *  Branch 2 (for-loop, items exist): loop body executes, PurchaseHistory objects built and saved
 *  Branch 3 (if productId != null, TRUE): deductStock path when productId is not null
 *    Sub-branch 3a (ifPresent → variant found): deductStock is called
 *    Sub-branch 3b (ifPresent → variant NOT found): deductStock NOT called (variant absent)
 *    Sub-branch 3c (catch exception): deductStock throws → exception caught, method completes normally
 *  Branch 4 (if productId != null, FALSE): productId is null → skip deductStock entirely
 */
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

    // -----------------------------------------------------------------------
    // Branch 1: items list is EMPTY → outer for-loop not entered, inner loop not entered
    // -----------------------------------------------------------------------

    @Test
    void savePurchaseHistory_shouldSaveEmptyList_whenNoItems() {
        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setItems(List.of());

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of());

        purchaseHistoryService.savePurchaseHistory(request);

        verify(purchaseHistoryRepository).saveAll(historyListCaptor.capture());
        assertEquals(0, historyListCaptor.getValue().size());
        // No productVariant lookup, no deductStock
        verify(productVariantRepository, never()).findById(any());
        verify(inventoryStockService, never()).deductStock(any(), anyInt(), anyLong(), anyString());
    }

    // -----------------------------------------------------------------------
    // Branch 2 + 3a: items exist, productId != null, variant FOUND → deductStock called
    // -----------------------------------------------------------------------

    @Test
    void savePurchaseHistory_shouldSaveItemsAndDeductStockSuccessfully() {
        SavePurchaseHistoryRequest.PurchaseItem item1 = new SavePurchaseHistoryRequest.PurchaseItem();
        item1.setProductId(101L);
        item1.setProductName("Product 1");
        item1.setQuantity(2);
        item1.setPrice(new BigDecimal("50000"));
        item1.setSubtotal(new BigDecimal("100000"));

        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setCustomerId(1L);
        request.setCustomerName("VIP Customer");
        request.setPaymentMethod("CASH");
        request.setItems(List.of(item1));

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
        assertEquals(1, historyListCaptor.getValue().size());
        verify(inventoryStockService).deductStock(variant, 2, 1L, "POS_SALE");
    }

    // -----------------------------------------------------------------------
    // Branch 3b: productId != null BUT variant NOT found in repository → ifPresent does NOT call deductStock
    // -----------------------------------------------------------------------

    @Test
    void savePurchaseHistory_shouldSkipDeductStock_whenVariantNotFound() {
        SavePurchaseHistoryRequest.PurchaseItem item = new SavePurchaseHistoryRequest.PurchaseItem();
        item.setProductId(202L);
        item.setProductName("Ghost Product");
        item.setQuantity(3);

        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setItems(List.of(item));

        PurchaseHistory savedHistory = PurchaseHistory.builder()
                .id(10L)
                .productId(202L)
                .quantity(3)
                .build();

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of(savedHistory));
        // findById returns empty → ifPresent lambda is NOT executed
        when(productVariantRepository.findById(202)).thenReturn(Optional.empty());

        purchaseHistoryService.savePurchaseHistory(request);

        verify(productVariantRepository).findById(202);
        verify(inventoryStockService, never()).deductStock(any(), anyInt(), anyLong(), anyString());
    }

    // -----------------------------------------------------------------------
    // Branch 3c: productId != null, variant FOUND, but deductStock THROWS → exception caught, no propagation
    // -----------------------------------------------------------------------

    @Test
    void savePurchaseHistory_shouldCatchException_whenDeductStockFails() {
        SavePurchaseHistoryRequest.PurchaseItem item1 = new SavePurchaseHistoryRequest.PurchaseItem();
        item1.setProductId(103L);
        item1.setQuantity(5);

        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setItems(List.of(item1));

        PurchaseHistory savedHistory = PurchaseHistory.builder()
                .id(3L)
                .productId(103L)
                .quantity(5)
                .build();

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of(savedHistory));

        ProductVariant variant = new ProductVariant();
        variant.setSku("SKU-103");
        when(productVariantRepository.findById(103)).thenReturn(Optional.of(variant));

        doThrow(new RuntimeException("Out of stock")).when(inventoryStockService)
                .deductStock(variant, 5, 3L, "POS_SALE");

        // Exception should be caught inside service — does NOT propagate
        purchaseHistoryService.savePurchaseHistory(request);

        verify(inventoryStockService).deductStock(variant, 5, 3L, "POS_SALE");
    }

    // -----------------------------------------------------------------------
    // Branch 4: productId == null → skip the entire if block (no findById, no deductStock)
    // -----------------------------------------------------------------------

    @Test
    void savePurchaseHistory_shouldSkipDeductStock_whenProductIdIsNull() {
        SavePurchaseHistoryRequest.PurchaseItem item1 = new SavePurchaseHistoryRequest.PurchaseItem();
        item1.setProductName("Combo Product"); // productId intentionally NOT set (null)
        item1.setQuantity(1);

        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        request.setItems(List.of(item1));

        PurchaseHistory savedHistory = PurchaseHistory.builder()
                .id(2L)
                .quantity(1)
                // productId is null
                .build();

        when(purchaseHistoryRepository.saveAll(anyList())).thenReturn(List.of(savedHistory));

        purchaseHistoryService.savePurchaseHistory(request);

        verify(purchaseHistoryRepository).saveAll(anyList());
        verify(productVariantRepository, never()).findById(any());
        verify(inventoryStockService, never()).deductStock(any(), anyInt(), anyLong(), anyString());
    }
}
