package com.smalltrend.controller.crm;

import com.smalltrend.controller.CRM.CampaignController;
import com.smalltrend.dto.CRM.CampaignResponse;
import com.smalltrend.dto.CRM.CreateCampaignRequest;
import com.smalltrend.service.CRM.CampaignService;
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
class CampaignControllerTest {

    @Mock
    private CampaignService campaignService;

    private CampaignController controller;

    @BeforeEach
    void setUp() {
        controller = new CampaignController(campaignService);
    }

    @Test
    void getAllCampaigns_shouldReturnOk() {
        List<CampaignResponse> expected = List.of(new CampaignResponse());
        when(campaignService.getAllCampaigns()).thenReturn(expected);

        ResponseEntity<List<CampaignResponse>> response = controller.getAllCampaigns();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void createCampaign_shouldReturnCreated() {
        CreateCampaignRequest request = new CreateCampaignRequest();
        CampaignResponse expected = new CampaignResponse();
        when(campaignService.createCampaign(request)).thenReturn(expected);

        ResponseEntity<?> response = controller.createCampaign(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void createCampaign_shouldReturnBadRequestOnException() {
        CreateCampaignRequest request = new CreateCampaignRequest();
        when(campaignService.createCampaign(request)).thenThrow(new RuntimeException("bad request"));

        ResponseEntity<?> response = controller.createCampaign(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("bad request", ((Map<?, ?>) response.getBody()).get("message"));
    }

    @Test
    void deleteCampaign_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.deleteCampaign(1);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(campaignService).deleteCampaign(1);
    }
}