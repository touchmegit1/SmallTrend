package com.smalltrend.controller.crm;

import com.smalltrend.controller.CRM.CustomerTierController;
import com.smalltrend.dto.CRM.CustomerTierResponse;
import com.smalltrend.dto.CRM.UpdateCustomerTierRequest;
import com.smalltrend.service.CRM.CustomerTierService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerTierControllerTest {

    @Mock
    private CustomerTierService customerTierService;

    private CustomerTierController controller;

    @BeforeEach
    void setUp() {
        controller = new CustomerTierController(customerTierService);
    }

    @Test
    void getAllTiers_shouldReturnOk() {
        List<CustomerTierResponse> expected = List.of(new CustomerTierResponse());
        when(customerTierService.getAllTiers()).thenReturn(expected);

        ResponseEntity<List<CustomerTierResponse>> response = controller.getAllTiers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void updateTier_shouldReturnOk() {
        UpdateCustomerTierRequest request = new UpdateCustomerTierRequest();
        CustomerTierResponse expected = new CustomerTierResponse();
        when(customerTierService.updateTier(1, request)).thenReturn(expected);

        ResponseEntity<CustomerTierResponse> response = controller.updateTier(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }
}