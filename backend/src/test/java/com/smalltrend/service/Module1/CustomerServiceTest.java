package com.smalltrend.service.Module1;

import com.smalltrend.dto.CRM.CustomerResponse;
import com.smalltrend.entity.Customer;
import com.smalltrend.repository.CustomerRepository;
import com.smalltrend.service.CRM.CustomerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    void getAllCustomers_shouldReturnEmptyList_whenNoCustomers() {
        when(customerRepository.findAll()).thenReturn(List.of());

        List<CustomerResponse> result = customerService.getAllCustomers();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(customerRepository).findAll();
    }

    @Test
    void getAllCustomers_shouldMapValues_whenCustomersExist() {
        Customer customer = Customer.builder()
                .id(1)
                .name("Alice")
                .phone("0900")
                .loyaltyPoints(10)
                .spentAmount(50000L)
                .build();

        when(customerRepository.findAll()).thenReturn(List.of(customer));

        List<CustomerResponse> result = customerService.getAllCustomers();

        assertEquals(1, result.size());
        assertEquals("Alice", result.get(0).getName());
        assertEquals(10, result.get(0).getLoyaltyPoints());
        assertEquals(50000L, result.get(0).getSpentAmount());
    }

    @Test
    void getCustomerById_shouldReturnResponse_whenFound() {
        Customer customer = Customer.builder().id(5).name("Bob").phone("0911").build();
        when(customerRepository.findById(5)).thenReturn(Optional.of(customer));

        CustomerResponse result = customerService.getCustomerById(5);

        assertEquals(5, result.getId());
        assertEquals("Bob", result.getName());
    }

    @Test
    void getCustomerById_shouldThrowException_whenNotFound() {
        when(customerRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> customerService.getCustomerById(99));

        assertEquals("Customer not found", ex.getMessage());
    }

    @Test
    void createCustomer_shouldSaveWithCleanPhone_whenPhoneHasSpaces() {
        when(customerRepository.findByPhoneIgnoreSpaces("0987654321")).thenReturn(Optional.empty());

        Customer saved = Customer.builder()
                .id(10)
                .name("Charlie")
                .phone("0987654321")
                .loyaltyPoints(null)
                .spentAmount(null)
                .build();
        when(customerRepository.save(any(Customer.class))).thenReturn(saved);

        CustomerResponse result = customerService.createCustomer("Charlie", "0987 654 321");

        assertEquals(10, result.getId());
        assertEquals("Charlie", result.getName());
        assertEquals("0987654321", result.getPhone());
        assertEquals(0, result.getLoyaltyPoints());
        assertEquals(0L, result.getSpentAmount());

        ArgumentCaptor<Customer> captor = ArgumentCaptor.forClass(Customer.class);
        verify(customerRepository).save(captor.capture());
        assertEquals("0987654321", captor.getValue().getPhone());
    }

    @Test
    void createCustomer_shouldSaveWithEmptyPhone_whenPhoneIsNull() {
        when(customerRepository.findByPhoneIgnoreSpaces("")).thenReturn(Optional.empty());

        Customer saved = Customer.builder().id(11).name("NullPhone").phone("").build();
        when(customerRepository.save(any(Customer.class))).thenReturn(saved);

        CustomerResponse result = customerService.createCustomer("NullPhone", null);

        assertEquals(11, result.getId());
        assertEquals("", result.getPhone());
        verify(customerRepository).findByPhoneIgnoreSpaces("");
    }

    @Test
    void createCustomer_shouldThrowException_whenPhoneAlreadyUsed() {
        Customer existing = Customer.builder().id(1).phone("0900").build();
        when(customerRepository.findByPhoneIgnoreSpaces("0900")).thenReturn(Optional.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> customerService.createCustomer("Another", "0900"));

        assertEquals("Số điện thoại này đã được sử dụng cho một khách hàng khác.", ex.getMessage());
        verify(customerRepository, never()).save(any());
    }

    @Test
    void updateCustomer_shouldThrowException_whenIdNotFound() {
        when(customerRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> customerService.updateCustomer(99, "Name", "Phone", 1, 100L));

        assertEquals("Customer not found", ex.getMessage());
        verify(customerRepository, never()).save(any());
    }

    @Test
    void updateCustomer_shouldUpdateAndCleanPhone_whenChangedAndUnique() {
        Customer current = Customer.builder()
                .id(1)
                .name("Old")
                .phone("0900")
                .loyaltyPoints(5)
                .spentAmount(100L)
                .build();
        when(customerRepository.findById(1)).thenReturn(Optional.of(current));
        when(customerRepository.findByPhoneIgnoreSpaces("0911222333")).thenReturn(Optional.empty());

        Customer updated = Customer.builder()
                .id(1)
                .name("New")
                .phone("0911222333")
                .loyaltyPoints(50)
                .spentAmount(999L)
                .build();
        when(customerRepository.save(any(Customer.class))).thenReturn(updated);

        CustomerResponse result = customerService.updateCustomer(1, "New", "0911 222 333", 50, 999L);

        assertEquals("New", result.getName());
        assertEquals("0911222333", result.getPhone());
        assertEquals(50, result.getLoyaltyPoints());
        assertEquals(999L, result.getSpentAmount());
        verify(customerRepository).findByPhoneIgnoreSpaces("0911222333");
    }

    @Test
    void updateCustomer_shouldThrowException_whenChangedPhoneBelongsToDifferentCustomer() {
        Customer current = Customer.builder().id(1).name("A").phone("0900").build();
        Customer other = Customer.builder().id(2).phone("0911").build();

        when(customerRepository.findById(1)).thenReturn(Optional.of(current));
        when(customerRepository.findByPhoneIgnoreSpaces("0911")).thenReturn(Optional.of(other));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> customerService.updateCustomer(1, "A", "0911", 1, 1L));

        assertEquals("Số điện thoại này đã được sử dụng cho một khách hàng khác.", ex.getMessage());
        verify(customerRepository, never()).save(any());
    }

    @Test
    void updateCustomer_shouldAllowChangedPhone_whenMatchedCustomerIsSameId() {
        Customer current = Customer.builder().id(1).name("A").phone("0900").loyaltyPoints(1).spentAmount(1L).build();
        Customer same = Customer.builder().id(1).phone("0911").build();

        when(customerRepository.findById(1)).thenReturn(Optional.of(current));
        when(customerRepository.findByPhoneIgnoreSpaces("0911")).thenReturn(Optional.of(same));

        Customer updated = Customer.builder().id(1).name("B").phone("0911").loyaltyPoints(9).spentAmount(8L).build();
        when(customerRepository.save(any(Customer.class))).thenReturn(updated);

        CustomerResponse result = customerService.updateCustomer(1, "B", "0911", 9, 8L);

        assertEquals("0911", result.getPhone());
        assertEquals(9, result.getLoyaltyPoints());
        assertEquals(8L, result.getSpentAmount());
        verify(customerRepository).save(current);
    }

    @Test
    void updateCustomer_shouldSkipPhoneDuplicateCheck_whenPhoneUnchanged() {
        Customer current = Customer.builder().id(3).name("Old").phone("0944").loyaltyPoints(5).spentAmount(200L).build();
        Customer updated = Customer.builder().id(3).name("New").phone("0944").loyaltyPoints(5).spentAmount(9999L).build();

        when(customerRepository.findById(3)).thenReturn(Optional.of(current));
        when(customerRepository.save(any(Customer.class))).thenReturn(updated);

        CustomerResponse result = customerService.updateCustomer(3, "New", "0944", null, 9999L);

        assertEquals(5, result.getLoyaltyPoints());
        assertEquals(9999L, result.getSpentAmount());
        verify(customerRepository, never()).findByPhoneIgnoreSpaces(any());
    }

    @Test
    void updateCustomer_shouldSkipPhoneDuplicateCheck_whenPhoneIsNull() {
        Customer current = Customer.builder().id(4).name("Old").phone("0999").loyaltyPoints(1).spentAmount(2L).build();
        Customer updated = Customer.builder().id(4).name("New").phone("0999").loyaltyPoints(100).spentAmount(2L).build();

        when(customerRepository.findById(4)).thenReturn(Optional.of(current));
        when(customerRepository.save(any(Customer.class))).thenReturn(updated);

        CustomerResponse result = customerService.updateCustomer(4, "New", null, 100, null);

        assertEquals("0999", result.getPhone());
        assertEquals(100, result.getLoyaltyPoints());
        assertEquals(2L, result.getSpentAmount());
        verify(customerRepository, never()).findByPhoneIgnoreSpaces(any());
    }

    @Test
    void updateCustomer_overloadWithoutSpentAmount_shouldDelegateWithNullSpentAmount() {
        Customer current = Customer.builder().id(6).name("Old").phone("0977").loyaltyPoints(1).spentAmount(10L).build();
        Customer updated = Customer.builder().id(6).name("New").phone("0977").loyaltyPoints(30).spentAmount(10L).build();

        when(customerRepository.findById(6)).thenReturn(Optional.of(current));
        when(customerRepository.save(any(Customer.class))).thenReturn(updated);

        CustomerResponse result = customerService.updateCustomer(6, "New", "0977", 30);

        assertEquals(30, result.getLoyaltyPoints());
        assertEquals(10L, result.getSpentAmount());
    }

    @Test
    void deleteCustomer_shouldDelete_whenIdExists() {
        when(customerRepository.existsById(1)).thenReturn(true);

        customerService.deleteCustomer(1);

        verify(customerRepository).deleteById(1);
    }

    @Test
    void deleteCustomer_shouldThrowException_whenIdDoesNotExist() {
        when(customerRepository.existsById(99)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> customerService.deleteCustomer(99));

        assertEquals("Customer not found", ex.getMessage());
        verify(customerRepository, never()).deleteById(any());
    }

    @Test
    void getCustomerByPhone_shouldReturnCustomer_whenPhoneProvidedAndFound() {
        Customer customer = Customer.builder().id(7).name("Frank").phone("0901234567").build();
        when(customerRepository.findByPhoneIgnoreSpaces("0901234567")).thenReturn(Optional.of(customer));

        CustomerResponse result = customerService.getCustomerByPhone("0901 234 567");

        assertEquals(7, result.getId());
        verify(customerRepository).findByPhoneIgnoreSpaces("0901234567");
    }

    @Test
    void getCustomerByPhone_shouldThrowException_whenPhoneIsNullAndNotFound() {
        when(customerRepository.findByPhoneIgnoreSpaces("")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> customerService.getCustomerByPhone(null));

        assertEquals("Customer not found with phone: null", ex.getMessage());
        verify(customerRepository).findByPhoneIgnoreSpaces("");
    }

    @Test
    void getCustomerByPhone_shouldThrowException_whenPhoneNotFound() {
        when(customerRepository.findByPhoneIgnoreSpaces("9999999999")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> customerService.getCustomerByPhone("9999999999"));

        assertEquals("Customer not found with phone: 9999999999", ex.getMessage());
        verify(customerRepository).findByPhoneIgnoreSpaces("9999999999");
    }
}
