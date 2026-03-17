package com.smalltrend.controller.crm;

import com.smalltrend.controller.CRM.LoyaltyGiftController;
import com.smalltrend.dto.CRM.CreateLoyaltyGiftRequest;
import com.smalltrend.dto.CRM.LoyaltyGiftResponse;
import com.smalltrend.dto.CRM.RedeemGiftRequest;
import com.smalltrend.dto.CRM.UpdateLoyaltyGiftRequest;
import com.smalltrend.service.CRM.LoyaltyGiftService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoyaltyGiftControllerTest {

    @Mock
    private LoyaltyGiftService loyaltyGiftService;

    private LoyaltyGiftController controller;

    @BeforeEach
    void setUp() {
        controller = new LoyaltyGiftController(loyaltyGiftService);
    }

    @Test
    void getAllGifts_shouldReturnOk() {
        List<LoyaltyGiftResponse> expected = List.of(new LoyaltyGiftResponse());
        when(loyaltyGiftService.getAllActiveGifts()).thenReturn(expected);

        ResponseEntity<List<LoyaltyGiftResponse>> response = controller.getAllGifts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void createGift_shouldReturnCreated() {
        CreateLoyaltyGiftRequest request = new CreateLoyaltyGiftRequest();
        LoyaltyGiftResponse expected = new LoyaltyGiftResponse();
        when(loyaltyGiftService.createGift(request)).thenReturn(expected);

        ResponseEntity<?> response = controller.createGift(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void createGift_shouldReturnBadRequestOnException() {
        CreateLoyaltyGiftRequest request = new CreateLoyaltyGiftRequest();
        when(loyaltyGiftService.createGift(request)).thenThrow(new RuntimeException("variant missing"));

        ResponseEntity<?> response = controller.createGift(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("variant missing", ((Map<?, ?>) response.getBody()).get("message"));
    }

    @Test
    void updateGiftViaPost_shouldDelegateToUpdate() {
        UpdateLoyaltyGiftRequest request = new UpdateLoyaltyGiftRequest();
        LoyaltyGiftResponse expected = new LoyaltyGiftResponse();
        when(loyaltyGiftService.updateGift(3, request)).thenReturn(expected);

        ResponseEntity<?> response = controller.updateGiftViaPost(3, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void redeemGift_shouldReturnOk() {
        RedeemGiftRequest request = new RedeemGiftRequest();
        LoyaltyGiftResponse expected = new LoyaltyGiftResponse();
        when(loyaltyGiftService.redeemGift(request)).thenReturn(expected);

        ResponseEntity<?> response = controller.redeemGift(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void deleteGift_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.deleteGift(5);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(loyaltyGiftService).deleteGift(5);
    }
}