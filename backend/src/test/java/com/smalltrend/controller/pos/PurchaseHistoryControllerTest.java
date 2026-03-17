package com.smalltrend.controller.pos;

import com.smalltrend.dto.pos.SavePurchaseHistoryRequest;
import com.smalltrend.entity.PurchaseHistory;
import com.smalltrend.service.PurchaseHistoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PurchaseHistoryControllerTest {

    @Mock
    private PurchaseHistoryService purchaseHistoryService;

    @InjectMocks
    private PurchaseHistoryController purchaseHistoryController;

    @Test
    void savePurchaseHistory_shouldCallServiceAndReturnOk() {
        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();
        doNothing().when(purchaseHistoryService).savePurchaseHistory(request);

        ResponseEntity<Void> response = purchaseHistoryController.savePurchaseHistory(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNull(response.getBody());
        verify(purchaseHistoryService).savePurchaseHistory(request);
    }

    @Test
    void getCustomerHistory_shouldReturnOkWithHistoryList() {
        PurchaseHistory history = PurchaseHistory.builder().id(1L).customerId(99L).productId(10L).quantity(2).build();
        when(purchaseHistoryService.getCustomerHistory(99L)).thenReturn(List.of(history));

        ResponseEntity<List<PurchaseHistory>> response = purchaseHistoryController.getCustomerHistory(99L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<PurchaseHistory> body = response.getBody();
        assertNotNull(body);
        assertEquals(1, body.size());
        assertEquals(99L, body.get(0).getCustomerId());
        verify(purchaseHistoryService).getCustomerHistory(99L);
    }
}
