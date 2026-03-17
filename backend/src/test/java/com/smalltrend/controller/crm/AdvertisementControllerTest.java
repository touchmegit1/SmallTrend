package com.smalltrend.controller.crm;

import com.smalltrend.controller.CRM.AdvertisementController;
import com.smalltrend.dto.CRM.AdvertisementResponse;
import com.smalltrend.dto.CRM.SaveAdvertisementRequest;
import com.smalltrend.service.CRM.AdvertisementService;
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
class AdvertisementControllerTest {

    @Mock
    private AdvertisementService advertisementService;

    private AdvertisementController controller;

    @BeforeEach
    void setUp() {
        controller = new AdvertisementController(advertisementService);
    }

    @Test
    void getActive_shouldReturnOk() {
        Map<String, AdvertisementResponse> expected = Map.of("LEFT", new AdvertisementResponse());
        when(advertisementService.getActiveAds()).thenReturn(expected);

        ResponseEntity<Map<String, AdvertisementResponse>> response = controller.getActive();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void create_shouldReturnOk() {
        SaveAdvertisementRequest request = new SaveAdvertisementRequest();
        AdvertisementResponse expected = new AdvertisementResponse();
        when(advertisementService.save(null, request)).thenReturn(expected);

        ResponseEntity<AdvertisementResponse> response = controller.create(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void getStats_shouldReturnOk() {
        Map<String, Object> expected = Map.of("total", 1L);
        when(advertisementService.getStats()).thenReturn(expected);

        ResponseEntity<Map<String, Object>> response = controller.getStats();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void delete_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.delete(5L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(advertisementService).delete(5L);
    }
}