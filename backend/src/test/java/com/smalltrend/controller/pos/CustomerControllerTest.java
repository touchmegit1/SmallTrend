package com.smalltrend.controller.pos;

import com.smalltrend.controller.CRM.CustomerController;
import com.smalltrend.dto.CRM.CreateCustomerRequest;
import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.dto.CRM.UpdateCustomerRequest;
import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.service.CRM.CustomerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private CustomerController customerController;

    @Test
    void getAllCustomers_shouldReturnOkWithList() {
        CustomerResponse c1 = new CustomerResponse();
        c1.setId(1);
        c1.setName("Alice");

        CustomerResponse c2 = new CustomerResponse();
        c2.setId(2);
        c2.setName("Bob");

        when(customerService.getAllCustomers()).thenReturn(List.of(c1, c2));

        ResponseEntity<List<CustomerResponse>> response = customerController.getAllCustomers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(customerService).getAllCustomers();
    }

    @Test
    void getCustomerById_shouldReturnOkWithCustomer() {
        CustomerResponse expected = new CustomerResponse();
        expected.setId(1);
        expected.setName("Alice");

        when(customerService.getCustomerById(1)).thenReturn(expected);

        ResponseEntity<CustomerResponse> response = customerController.getCustomerById(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(customerService).getCustomerById(1);
    }

    @Test
    void getCustomerByPhone_shouldReturnOk_whenFound() {
        CustomerResponse expected = new CustomerResponse();
        expected.setId(1);
        expected.setPhone("0987654321");

        when(customerService.getCustomerByPhone("0987654321")).thenReturn(expected);

        ResponseEntity<?> response = customerController.getCustomerByPhone("0987654321");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof CustomerResponse);
        assertEquals(expected, response.getBody());
        verify(customerService).getCustomerByPhone("0987654321");
    }

    @Test
    void getCustomerByPhone_shouldReturnNotFoundWithMessageResponse_whenExceptionThrown() {
        when(customerService.getCustomerByPhone("000"))
                .thenThrow(new RuntimeException("Customer not found with phone: 000"));

        ResponseEntity<?> response = customerController.getCustomerByPhone("000");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        Object rawBody = Objects.requireNonNull(response.getBody());
        assertTrue(rawBody instanceof MessageResponse);
        MessageResponse body = (MessageResponse) rawBody;
        assertEquals("Customer not found with phone: 000", body.getMessage());
        verify(customerService).getCustomerByPhone("000");
    }

    @Test
    void searchCustomerByPhone_shouldReturnOkWithCustomer() {
        CustomerResponse expected = new CustomerResponse();
        expected.setId(2);
        expected.setPhone("0123456789");

        when(customerService.getCustomerByPhone("0123456789")).thenReturn(expected);

        ResponseEntity<CustomerResponse> response = customerController.searchCustomerByPhone("0123456789");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(customerService).getCustomerByPhone("0123456789");
    }

    @Test
    void createCustomer_shouldReturnCreated() {
        CreateCustomerRequest request = new CreateCustomerRequest();
        request.setName("New Customer");
        request.setPhone("0987654321");

        CustomerResponse expected = new CustomerResponse();
        expected.setId(1);
        expected.setName("New Customer");
        expected.setPhone("0987654321");

        when(customerService.createCustomer("New Customer", "0987654321")).thenReturn(expected);

        ResponseEntity<CustomerResponse> response = customerController.createCustomer(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(customerService).createCustomer("New Customer", "0987654321");
    }

    @Test
    void updateCustomer_shouldReturnOk() {
        UpdateCustomerRequest request = new UpdateCustomerRequest();
        request.setName("Updated Name");
        request.setPhone("1111");
        request.setLoyaltyPoints(50);
        request.setSpentAmount(1000L);

        CustomerResponse expected = new CustomerResponse();
        expected.setId(1);
        expected.setName("Updated Name");
        expected.setPhone("1111");
        expected.setLoyaltyPoints(50);
        expected.setSpentAmount(1000L);

        when(customerService.updateCustomer(1, "Updated Name", "1111", 50, 1000L)).thenReturn(expected);

        ResponseEntity<CustomerResponse> response = customerController.updateCustomer(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(customerService).updateCustomer(1, "Updated Name", "1111", 50, 1000L);
    }

    @Test
    void deleteCustomer_shouldReturnNoContent() {
        doNothing().when(customerService).deleteCustomer(1);

        ResponseEntity<Void> response = customerController.deleteCustomer(1);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(customerService).deleteCustomer(1);
    }
}
