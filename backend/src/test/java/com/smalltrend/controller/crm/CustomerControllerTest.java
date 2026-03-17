package com.smalltrend.controller.crm;

import com.smalltrend.controller.CRM.CustomerController;
import com.smalltrend.dto.CRM.CreateCustomerRequest;
import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.dto.CRM.UpdateCustomerRequest;
import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.service.CRM.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    private CustomerController controller;

    @BeforeEach
    void setUp() {
        controller = new CustomerController(customerService);
    }

    @Test
    void getAllCustomers_shouldReturnOk() {
        List<CustomerResponse> expected = List.of(new CustomerResponse());
        when(customerService.getAllCustomers()).thenReturn(expected);

        ResponseEntity<List<CustomerResponse>> response = controller.getAllCustomers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void getCustomerByPhone_shouldReturnNotFoundMessage() {
        when(customerService.getCustomerByPhone("0909")).thenThrow(new RuntimeException("missing"));

        ResponseEntity<?> response = controller.getCustomerByPhone("0909");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        MessageResponse body = assertInstanceOf(MessageResponse.class, response.getBody());
        assertEquals("missing", body.getMessage());
    }

    @Test
    void createCustomer_shouldReturnCreated() {
        CreateCustomerRequest request = new CreateCustomerRequest();
        request.setName("Alice");
        request.setPhone("0909");
        CustomerResponse expected = new CustomerResponse();
        when(customerService.createCustomer("Alice", "0909")).thenReturn(expected);

        ResponseEntity<CustomerResponse> response = controller.createCustomer(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void updateCustomer_shouldReturnOk() {
        UpdateCustomerRequest request = new UpdateCustomerRequest();
        request.setName("Updated");
        request.setPhone("0909");
        request.setLoyaltyPoints(1);
        request.setSpentAmount(2L);
        CustomerResponse expected = new CustomerResponse();
        when(customerService.updateCustomer(1, "Updated", "0909", 1, 2L)).thenReturn(expected);

        ResponseEntity<CustomerResponse> response = controller.updateCustomer(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void deleteCustomer_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.deleteCustomer(1);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(customerService).deleteCustomer(1);
    }
}