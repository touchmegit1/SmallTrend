package com.smalltrend.service.crm;

import com.smalltrend.dto.CRM.CustomerTierResponse;
import com.smalltrend.dto.CRM.UpdateCustomerTierRequest;
import com.smalltrend.entity.CustomerTier;
import com.smalltrend.repository.CustomerTierRepository;
import com.smalltrend.service.CRM.CustomerTierService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerTierServiceTest {

    @Mock
    private CustomerTierRepository customerTierRepository;

    @InjectMocks
    private CustomerTierService customerTierService;

    @Test
    void getAllTiers_shouldMapRepositoryResult() {
        CustomerTier tier = CustomerTier.builder()
                .id(1)
                .tierCode("BRONZE")
                .tierName("Bronze")
                .priority(1)
                .isActive(true)
                .build();

        when(customerTierRepository.findAllByOrderByPriorityAsc()).thenReturn(List.of(tier));

        List<CustomerTierResponse> responses = customerTierService.getAllTiers();

        assertEquals(1, responses.size());
        assertEquals("BRONZE", responses.get(0).getTierCode());
    }

    @Test
    void updateTier_shouldOnlyUpdateProvidedFields() {
        CustomerTier tier = CustomerTier.builder()
                .id(2)
                .tierCode("SILVER")
                .tierName("Silver")
                .minSpending(new BigDecimal("1000000"))
                .pointsMultiplier(new BigDecimal("1.2"))
                .color("#AAA")
                .isActive(true)
                .description("Old")
                .build();

        UpdateCustomerTierRequest request = new UpdateCustomerTierRequest();
        request.setTierName("Silver Plus");
        request.setColor("#BBB");
        request.setDescription("Updated");

        when(customerTierRepository.findById(2)).thenReturn(Optional.of(tier));
        when(customerTierRepository.save(tier)).thenReturn(tier);

        CustomerTierResponse response = customerTierService.updateTier(2, request);

        assertEquals("Silver Plus", response.getTierName());
        assertEquals("#BBB", response.getColor());
        assertEquals("Updated", response.getDescription());
        assertEquals(new BigDecimal("1000000"), response.getMinSpending());
    }

    @Test
    void updateTier_shouldThrowWhenTierMissing() {
        when(customerTierRepository.findById(8)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> customerTierService.updateTier(8, new UpdateCustomerTierRequest()));

        assertEquals("Customer tier not found: 8", exception.getMessage());
    }
}