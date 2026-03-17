package com.smalltrend.service.crm;

import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.entity.Customer;
import com.smalltrend.repository.CustomerRepository;
import com.smalltrend.service.CRM.CustomerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    void getAllCustomers_shouldMapNullLoyaltyAndSpentDefaults() {
        Customer customer = Customer.builder().id(1).name("Alice").phone("0909").loyaltyPoints(null).spentAmount(null).build();
        when(customerRepository.findAll()).thenReturn(List.of(customer));

        List<CustomerResponse> responses = customerService.getAllCustomers();

        assertEquals(1, responses.size());
        assertEquals(0, responses.get(0).getLoyaltyPoints());
        assertEquals(0L, responses.get(0).getSpentAmount());
    }

    @Test
    void createCustomer_shouldNormalizePhoneBeforeSaving() {
        when(customerRepository.findByPhoneIgnoreSpaces("0909123456")).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer saved = invocation.getArgument(0);
            saved.setId(1);
            return saved;
        });

        CustomerResponse response = customerService.createCustomer("Bob", "0909 123 456");

        assertEquals("0909123456", response.getPhone());
    }

    @Test
    void createCustomer_shouldThrowWhenPhoneAlreadyExists() {
        when(customerRepository.findByPhoneIgnoreSpaces("0909123456"))
                .thenReturn(Optional.of(Customer.builder().id(10).phone("0909123456").build()));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> customerService.createCustomer("Bob", "0909 123 456"));

        assertEquals("Số điện thoại này đã được sử dụng cho một khách hàng khác.", exception.getMessage());
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void updateCustomer_shouldRejectPhoneOwnedByAnotherCustomer() {
        Customer customer = Customer.builder().id(1).name("Alice").phone("0909000000").loyaltyPoints(10).spentAmount(1000L).build();
        Customer existing = Customer.builder().id(2).phone("0909123456").build();

        when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
        when(customerRepository.findByPhoneIgnoreSpaces("0909123456")).thenReturn(Optional.of(existing));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> customerService.updateCustomer(1, "Alice Updated", "0909 123 456", 20, 5000L));

        assertEquals("Số điện thoại này đã được sử dụng cho một khách hàng khác.", exception.getMessage());
    }

    @Test
    void getCustomerByPhone_shouldNormalizeSearchInput() {
        Customer customer = Customer.builder().id(5).name("Carol").phone("0909555666").loyaltyPoints(5).spentAmount(50000L).build();
        when(customerRepository.findByPhoneIgnoreSpaces("0909555666")).thenReturn(Optional.of(customer));

        CustomerResponse response = customerService.getCustomerByPhone("0909 555 666");

        assertEquals(5, response.getId());
        assertEquals("Carol", response.getName());
    }

    @Test
    void deleteCustomer_shouldThrowWhenMissing() {
        when(customerRepository.existsById(99)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> customerService.deleteCustomer(99));

        assertEquals("Customer not found", exception.getMessage());
    }
}