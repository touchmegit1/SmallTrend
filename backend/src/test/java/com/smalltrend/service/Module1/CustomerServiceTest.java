package com.smalltrend.service.Module1;

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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test for CustomerService
 * Coverage target: 100% Statement Coverage + 100% Decision Coverage
 *
 * Methods tested and their decision branches:
 *
 *  1. getAllCustomers()
 *     - Returns empty list
 *     - Returns list with items (mapToResponse: loyaltyPoints != null, spentAmount != null)
 *
 *  2. getCustomerById()
 *     - Branch TRUE : customer found → return response
 *     - Branch FALSE: customer not found → throw RuntimeException
 *
 *  3. createCustomer()
 *     - Always saves and maps (mapToResponse: loyaltyPoints == null, spentAmount == null)
 *
 *  4. updateCustomer()
 *     - Branch A : customer not found → throw RuntimeException
 *     - Branch B : loyaltyPoints != null AND spentAmount != null → set both
 *     - Branch C : loyaltyPoints == null AND spentAmount == null → skip both (already covered in existing test)
 *     - Branch D : loyaltyPoints != null AND spentAmount == null
 *     - Branch E : loyaltyPoints == null AND spentAmount != null
 *
 *  5. deleteCustomer()
 *     - Branch TRUE : exists → delete
 *     - Branch FALSE: not exists → throw RuntimeException
 *
 *  6. getCustomerByPhone()
 *     - Branch when phone == null (cleanPhone = "")
 *     - Branch when phone != null
 *     - Branch: customer not found → throw RuntimeException
 *     - Branch: customer found → return response
 *
 *  mapToResponse() — private, covered via above:
 *     - loyaltyPoints != null branch (test B / listWith items)
 *     - loyaltyPoints == null branch (test createCustomer / test C)
 *     - spentAmount  != null branch (test B)
 *     - spentAmount  == null branch (test createCustomer / test C)
 */
@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    // -----------------------------------------------------------------------
    // 1. getAllCustomers
    // -----------------------------------------------------------------------

    @Test
    void getAllCustomers_shouldReturnEmptyList_whenNoCustomers() {
        when(customerRepository.findAll()).thenReturn(List.of());

        List<CustomerResponse> result = customerService.getAllCustomers();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(customerRepository).findAll();
    }

    /**
     * Also covers mapToResponse with non-null loyaltyPoints and spentAmount
     */
    @Test
    void getAllCustomers_shouldReturnMappedList_whenCustomersExist() {
        Customer c = Customer.builder()
                .id(1).name("Alice").phone("0900")
                .loyaltyPoints(10).spentAmount(50000L)
                .build();

        when(customerRepository.findAll()).thenReturn(List.of(c));

        List<CustomerResponse> result = customerService.getAllCustomers();

        assertEquals(1, result.size());
        assertEquals("Alice", result.get(0).getName());
        assertEquals(10, result.get(0).getLoyaltyPoints());
        assertEquals(50000L, result.get(0).getSpentAmount());
    }

    // -----------------------------------------------------------------------
    // 2. getCustomerById — Decision: found / not found
    // -----------------------------------------------------------------------

    @Test
    void getCustomerById_shouldReturnResponse_whenFound() {
        Customer c = Customer.builder()
                .id(5).name("Bob").phone("0911")
                .loyaltyPoints(0).spentAmount(0L)
                .build();

        when(customerRepository.findById(5)).thenReturn(Optional.of(c));

        CustomerResponse result = customerService.getCustomerById(5);

        assertNotNull(result);
        assertEquals(5, result.getId());
        assertEquals("Bob", result.getName());
    }

    @Test
    void getCustomerById_shouldThrowException_whenNotFound() {
        when(customerRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> customerService.getCustomerById(99));

        assertEquals("Customer not found", ex.getMessage());
    }

    // -----------------------------------------------------------------------
    // 3. createCustomer — also covers mapToResponse(null, null)
    // -----------------------------------------------------------------------

    @Test
    void createCustomer_shouldSaveAndReturnResponse() {
        Customer saved = Customer.builder()
                .id(10).name("Charlie").phone("0922")
                .loyaltyPoints(null).spentAmount(null)
                .build();

        when(customerRepository.save(any(Customer.class))).thenReturn(saved);

        CustomerResponse result = customerService.createCustomer("Charlie", "0922");

        assertNotNull(result);
        assertEquals(10, result.getId());
        assertEquals("Charlie", result.getName());
        // null branches in mapToResponse → default 0
        assertEquals(0, result.getLoyaltyPoints());
        assertEquals(0L, result.getSpentAmount());
        verify(customerRepository).save(any(Customer.class));
    }

    // -----------------------------------------------------------------------
    // 4. updateCustomer — multiple decision branches
    // -----------------------------------------------------------------------

    /**
     * Branch A: customer not found → RuntimeException
     */
    @Test
    void updateCustomer_shouldThrowException_whenIdNotFound() {
        when(customerRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> customerService.updateCustomer(99, "Name", "Phone", 100, 5000L));

        assertEquals("Customer not found", exception.getMessage());
        verify(customerRepository, never()).save(any());
    }

    /**
     * Branch B: loyaltyPoints != null AND spentAmount != null → both updated
     */
    @Test
    void updateCustomer_shouldUpdateAllFields_whenPointsAndAmountAreNotNull() {
        Customer existingCustomer = Customer.builder()
                .id(1).name("Old Name").phone("0000")
                .loyaltyPoints(50).spentAmount(0L)
                .build();

        when(customerRepository.findById(1)).thenReturn(Optional.of(existingCustomer));

        Customer updatedCustomer = Customer.builder()
                .id(1).name("New Name").phone("1111")
                .loyaltyPoints(200).spentAmount(500000L)
                .build();

        when(customerRepository.save(any(Customer.class))).thenReturn(updatedCustomer);

        CustomerResponse response = customerService.updateCustomer(1, "New Name", "1111", 200, 500000L);

        assertNotNull(response);
        assertEquals("New Name", response.getName());
        assertEquals("1111", response.getPhone());
        assertEquals(200, response.getLoyaltyPoints());
        assertEquals(500000L, response.getSpentAmount());
        verify(customerRepository).save(existingCustomer);
    }

    /**
     * Branch C: loyaltyPoints == null AND spentAmount == null → neither updated
     * Also covers mapToResponse with null fields → returns 0 defaults
     */
    @Test
    void updateCustomer_shouldNotUpdatePointsAndAmount_whenBothAreNull() {
        Customer existingCustomer = Customer.builder()
                .id(1).name("Old Name").phone("0000")
                .loyaltyPoints(null).spentAmount(null)
                .build();

        when(customerRepository.findById(1)).thenReturn(Optional.of(existingCustomer));

        Customer updatedCustomer = Customer.builder()
                .id(1).name("New Name").phone("1111")
                .loyaltyPoints(null).spentAmount(null)
                .build();

        when(customerRepository.save(any(Customer.class))).thenReturn(updatedCustomer);

        CustomerResponse response = customerService.updateCustomer(1, "New Name", "1111", null, null);

        assertNotNull(response);
        assertEquals("New Name", response.getName());
        assertEquals("1111", response.getPhone());
        assertEquals(0, response.getLoyaltyPoints());
        assertEquals(0L, response.getSpentAmount());
        verify(customerRepository).save(existingCustomer);
    }

    /**
     * Branch D: loyaltyPoints != null AND spentAmount == null → only loyaltyPoints updated
     */
    @Test
    void updateCustomer_shouldUpdateOnlyLoyaltyPoints_whenSpentAmountIsNull() {
        Customer existingCustomer = Customer.builder()
                .id(2).name("Dave").phone("0933")
                .loyaltyPoints(10).spentAmount(1000L)
                .build();

        when(customerRepository.findById(2)).thenReturn(Optional.of(existingCustomer));

        Customer updatedCustomer = Customer.builder()
                .id(2).name("Dave Updated").phone("0933")
                .loyaltyPoints(99).spentAmount(1000L)
                .build();

        when(customerRepository.save(any(Customer.class))).thenReturn(updatedCustomer);

        CustomerResponse response = customerService.updateCustomer(2, "Dave Updated", "0933", 99, null);

        assertNotNull(response);
        assertEquals(99, response.getLoyaltyPoints());
        assertEquals(1000L, response.getSpentAmount());
        verify(customerRepository).save(existingCustomer);
    }

    /**
     * Branch E: loyaltyPoints == null AND spentAmount != null → only spentAmount updated
     */
    @Test
    void updateCustomer_shouldUpdateOnlySpentAmount_whenLoyaltyPointsIsNull() {
        Customer existingCustomer = Customer.builder()
                .id(3).name("Eve").phone("0944")
                .loyaltyPoints(5).spentAmount(200L)
                .build();

        when(customerRepository.findById(3)).thenReturn(Optional.of(existingCustomer));

        Customer updatedCustomer = Customer.builder()
                .id(3).name("Eve Updated").phone("0944")
                .loyaltyPoints(5).spentAmount(9999L)
                .build();

        when(customerRepository.save(any(Customer.class))).thenReturn(updatedCustomer);

        CustomerResponse response = customerService.updateCustomer(3, "Eve Updated", "0944", null, 9999L);

        assertNotNull(response);
        assertEquals(5, response.getLoyaltyPoints());
        assertEquals(9999L, response.getSpentAmount());
        verify(customerRepository).save(existingCustomer);
    }

    // -----------------------------------------------------------------------
    // 5. deleteCustomer — Decision: exists / not exists
    // -----------------------------------------------------------------------

    @Test
    void deleteCustomer_shouldDelete_whenIdExists() {
        when(customerRepository.existsById(1)).thenReturn(true);

        customerService.deleteCustomer(1);

        verify(customerRepository).deleteById(1);
    }

    @Test
    void deleteCustomer_shouldThrowException_whenIdDoesNotExist() {
        when(customerRepository.existsById(99)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> customerService.deleteCustomer(99));

        assertEquals("Customer not found", exception.getMessage());
        verify(customerRepository, never()).deleteById(any());
    }

    // -----------------------------------------------------------------------
    // 6. getCustomerByPhone — Decision: phone null vs non-null, found / not found
    // -----------------------------------------------------------------------

    /**
     * Branch: phone != null → replaceAll executed on actual value
     * Sub-branch: customer found → return response
     */
    @Test
    void getCustomerByPhone_shouldReturnCustomer_whenPhoneIsNotNullAndFound() {
        Customer c = Customer.builder()
                .id(7).name("Frank").phone("0901234567")
                .loyaltyPoints(0).spentAmount(0L)
                .build();

        // Service calls replaceAll on phone string, then passes cleaned value
        when(customerRepository.findByPhoneIgnoreSpaces("0901234567"))
                .thenReturn(Optional.of(c));

        CustomerResponse result = customerService.getCustomerByPhone("0901234567");

        assertNotNull(result);
        assertEquals(7, result.getId());
        verify(customerRepository).findByPhoneIgnoreSpaces("0901234567");
    }

    /**
     * Branch: phone == null → cleanPhone = "" → still calls findByPhoneIgnoreSpaces("")
     * Sub-branch: customer not found → throw RuntimeException
     */
    @Test
    void getCustomerByPhone_shouldThrowException_whenPhoneIsNullAndNotFound() {
        when(customerRepository.findByPhoneIgnoreSpaces(""))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> customerService.getCustomerByPhone(null));

        assertTrue(ex.getMessage().contains("Customer not found with phone:"));
        verify(customerRepository).findByPhoneIgnoreSpaces("");
    }

    /**
     * Branch: phone != null → but customer not found → throw RuntimeException
     */
    @Test
    void getCustomerByPhone_shouldThrowException_whenPhoneIsNotNullButNotFound() {
        when(customerRepository.findByPhoneIgnoreSpaces("9999999999"))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> customerService.getCustomerByPhone("9999999999"));

        assertTrue(ex.getMessage().contains("Customer not found with phone: 9999999999"));
        verify(customerRepository).findByPhoneIgnoreSpaces("9999999999");
    }
}
