package com.smalltrend.service.Module1;

import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.entity.Customer;
import com.smalltrend.repository.CustomerRepository;
import com.smalltrend.service.CRM.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        customerService = new CustomerService(customerRepository);
    }

    @Test
    void getAllCustomers_shouldReturnListOfCustomers() {
        Customer customer = Customer.builder().id(1).name("Nguyen Van A").phone("0123456789").loyaltyPoints(100).spentAmount(500000L).build();
        when(customerRepository.findAll()).thenReturn(List.of(customer));

        List<CustomerResponse> responses = customerService.getAllCustomers();

        assertEquals(1, responses.size());
        assertEquals("Nguyen Van A", responses.get(0).getName());
        assertEquals("0123456789", responses.get(0).getPhone());
        assertEquals(100, responses.get(0).getLoyaltyPoints());
        assertEquals(500000L, responses.get(0).getSpentAmount());
    }

    @Test
    void getCustomerById_shouldReturnCustomer_whenIdValid() {
        Customer customer = Customer.builder().id(1).name("Nguyen Van A").build();
        when(customerRepository.findById(1)).thenReturn(Optional.of(customer));

        CustomerResponse response = customerService.getCustomerById(1);

        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals("Nguyen Van A", response.getName());
    }

    @Test
    void getCustomerById_shouldThrowException_whenIdInvalid() {
        when(customerRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> customerService.getCustomerById(99));
        assertEquals("Customer not found", exception.getMessage());
    }

    @Test
    void createCustomer_shouldReturnCreatedCustomer() {
        Customer savedCustomer = Customer.builder().id(1).name("New Customer").phone("0987654321").build();
        when(customerRepository.save(any(Customer.class))).thenReturn(savedCustomer);

        CustomerResponse response = customerService.createCustomer("New Customer", "0987654321");

        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals("New Customer", response.getName());
        assertEquals("0987654321", response.getPhone());
    }

    @Test
    void updateCustomer_shouldReturnUpdatedCustomer_whenValid() {
        Customer existingCustomer = Customer.builder().id(1).name("Old Name").phone("0000").loyaltyPoints(50).build();
        when(customerRepository.findById(1)).thenReturn(Optional.of(existingCustomer));

        Customer updatedCustomer = Customer.builder().id(1).name("New Name").phone("1111").loyaltyPoints(200).build();
        when(customerRepository.save(any(Customer.class))).thenReturn(updatedCustomer);

        CustomerResponse response = customerService.updateCustomer(1, "New Name", "1111", 200);

        assertNotNull(response);
        assertEquals("New Name", response.getName());
        assertEquals("1111", response.getPhone());
        assertEquals(200, response.getLoyaltyPoints());
    }

    @Test
    void updateCustomer_shouldThrowException_whenIdInvalid() {
        when(customerRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> customerService.updateCustomer(99, "Name", "Phone", 100));
        assertEquals("Customer not found", exception.getMessage());
        verify(customerRepository, never()).save(any());
    }

    @Test
    void deleteCustomer_shouldDelete_whenIdValid() {
        when(customerRepository.existsById(1)).thenReturn(true);

        customerService.deleteCustomer(1);

        verify(customerRepository).deleteById(1);
    }

    @Test
    void deleteCustomer_shouldThrowException_whenIdInvalid() {
        when(customerRepository.existsById(99)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> customerService.deleteCustomer(99));
        assertEquals("Customer not found", exception.getMessage());
        verify(customerRepository, never()).deleteById(any());
    }

    @Test
    void getCustomerByPhone_shouldReturnCustomer_whenPhoneExists() {
        Customer customer = Customer.builder().id(1).name("Test Phone").phone(" 0912 345 678 ").build();
        when(customerRepository.findByPhoneIgnoreSpaces("0912345678")).thenReturn(Optional.of(customer));

        CustomerResponse response = customerService.getCustomerByPhone(" 0912 345 678 ");

        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals("Test Phone", response.getName());
    }

    @Test
    void getCustomerByPhone_shouldThrowException_whenPhoneDoesNotExist() {
        when(customerRepository.findByPhoneIgnoreSpaces("000")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> customerService.getCustomerByPhone("000"));
        assertEquals("Customer not found with phone: 000", exception.getMessage());
    }
}
