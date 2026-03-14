package com.smalltrend.controller.pos;

import com.smalltrend.controller.CRM.CustomerController;
import com.smalltrend.dto.CRM.CreateCustomerRequest;
import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.dto.CRM.UpdateCustomerRequest;
import com.smalltrend.service.CRM.CustomerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit Test for CustomerController
 * Coverage target: 100% Statement Coverage + 100% Decision Coverage
 *
 * Methods tested:
 *  1. getAllCustomers()
 *  2. getCustomerById()
 *  3. getCustomerByPhone()  — try branch (success) + catch branch (exception)
 *  4. searchCustomerByPhone()
 *  5. createCustomer()
 *  6. updateCustomer()
 *  7. deleteCustomer()
 */
@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private CustomerController customerController;

    // -----------------------------------------------------------------------
    // 1. getAllCustomers
    // -----------------------------------------------------------------------

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

    // -----------------------------------------------------------------------
    // 2. getCustomerById
    // -----------------------------------------------------------------------

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

    // -----------------------------------------------------------------------
    // 3. getCustomerByPhone — Decision branch: success (try) & exception (catch)
    // -----------------------------------------------------------------------

    /**
     * Branch TRUE: service returns successfully → 200 OK
     */
    @Test
    void getCustomerByPhone_shouldReturnOk_whenFound() {
        CustomerResponse expected = new CustomerResponse();
        expected.setId(1);
        expected.setPhone("0987654321");

        when(customerService.getCustomerByPhone("0987654321")).thenReturn(expected);

        ResponseEntity<?> response = customerController.getCustomerByPhone("0987654321");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(customerService).getCustomerByPhone("0987654321");
    }

    /**
     * Branch FALSE: service throws exception → 404 NOT_FOUND with message body
     */
    @Test
    void getCustomerByPhone_shouldReturnNotFound_whenExceptionThrown() {
        when(customerService.getCustomerByPhone("000"))
                .thenThrow(new RuntimeException("Customer not found with phone: 000"));

        ResponseEntity<?> response = customerController.getCustomerByPhone("000");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(customerService).getCustomerByPhone("000");
    }

    // -----------------------------------------------------------------------
    // 4. searchCustomerByPhone
    // -----------------------------------------------------------------------

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

    // -----------------------------------------------------------------------
    // 5. createCustomer
    // -----------------------------------------------------------------------

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

    // -----------------------------------------------------------------------
    // 6. updateCustomer
    // -----------------------------------------------------------------------

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

    // -----------------------------------------------------------------------
    // 7. deleteCustomer
    // -----------------------------------------------------------------------

    @Test
    void deleteCustomer_shouldReturnNoContent() {
        doNothing().when(customerService).deleteCustomer(1);

        ResponseEntity<Void> response = customerController.deleteCustomer(1);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(customerService).deleteCustomer(1);
    }
}
