package com.smalltrend.controller.pos;

import com.smalltrend.dto.pos.SavePurchaseHistoryRequest;
import com.smalltrend.service.PurchaseHistoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

/**
 * Unit Test for PurchaseHistoryController
 * Coverage target: 100% Statement Coverage + 100% Decision Coverage
 *
 * Methods tested:
 *  1. savePurchaseHistory() — only method; no branching logic in controller itself
 */
@ExtendWith(MockitoExtension.class)
class PurchaseHistoryControllerTest {

    @Mock
    private PurchaseHistoryService purchaseHistoryService;

    @InjectMocks
    private PurchaseHistoryController purchaseHistoryController;

    // -----------------------------------------------------------------------
    // 1. savePurchaseHistory
    // -----------------------------------------------------------------------

    /**
     * Happy path: service executes without exception → 200 OK with no body
     */
    @Test
    void savePurchaseHistory_shouldCallServiceAndReturnOk() {
        SavePurchaseHistoryRequest request = new SavePurchaseHistoryRequest();

        doNothing().when(purchaseHistoryService).savePurchaseHistory(request);

        ResponseEntity<Void> response = purchaseHistoryController.savePurchaseHistory(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNull(response.getBody());
        verify(purchaseHistoryService).savePurchaseHistory(request);
    }
}
