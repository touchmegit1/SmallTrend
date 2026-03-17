package com.smalltrend.service.crm;

import com.smalltrend.dto.CRM.CreateLoyaltyGiftRequest;
import com.smalltrend.dto.CRM.GiftRedemptionHistoryResponse;
import com.smalltrend.dto.CRM.LoyaltyGiftResponse;
import com.smalltrend.dto.CRM.RedeemGiftRequest;
import com.smalltrend.dto.CRM.UpdateLoyaltyGiftRequest;
import com.smalltrend.entity.Customer;
import com.smalltrend.entity.GiftRedemptionHistory;
import com.smalltrend.entity.LoyaltyGift;
import com.smalltrend.entity.LoyaltyTransaction;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.repository.CustomerRepository;
import com.smalltrend.repository.GiftRedemptionHistoryRepository;
import com.smalltrend.repository.LoyaltyGiftRepository;
import com.smalltrend.repository.LoyaltyTransactionRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.service.CRM.LoyaltyGiftService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoyaltyGiftServiceTest {

    @Mock
    private LoyaltyGiftRepository loyaltyGiftRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private LoyaltyTransactionRepository loyaltyTransactionRepository;
    @Mock
    private GiftRedemptionHistoryRepository historyRepository;

    @InjectMocks
    private LoyaltyGiftService loyaltyGiftService;

    @Test
    void getAllActiveGifts_shouldMapGiftData() {
        Product product = Product.builder().id(1).name("Coffee").imageUrl("product-image.png").build();
        ProductVariant variant = ProductVariant.builder().id(1).product(product).sku("SKU-1").imageUrl("").build();
        LoyaltyGift gift = LoyaltyGift.builder().id(2).variant(variant).name("Gift A").requiredPoints(100).stock(5).isActive(true).build();

        when(loyaltyGiftRepository.findByIsActiveTrue()).thenReturn(List.of(gift));

        List<LoyaltyGiftResponse> responses = loyaltyGiftService.getAllActiveGifts();

        assertEquals(1, responses.size());
        assertEquals("Coffee", responses.get(0).getProductName());
        assertEquals("product-image.png", responses.get(0).getImage());
    }

    @Test
    void createGift_shouldThrowWhenVariantMissing() {
        CreateLoyaltyGiftRequest request = new CreateLoyaltyGiftRequest();
        request.setVariantId(99);

        when(productVariantRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> loyaltyGiftService.createGift(request));

        assertEquals("Product variant not found", exception.getMessage());
    }

    @Test
    void updateGift_shouldValidateRequiredPointsAndStock() {
        LoyaltyGift gift = LoyaltyGift.builder().id(1).name("Gift").requiredPoints(10).stock(2).isActive(true).build();
        when(loyaltyGiftRepository.findById(1)).thenReturn(Optional.of(gift));

        UpdateLoyaltyGiftRequest invalidPoints = new UpdateLoyaltyGiftRequest();
        invalidPoints.setRequiredPoints(0);
        RuntimeException pointsException = assertThrows(RuntimeException.class,
                () -> loyaltyGiftService.updateGift(1, invalidPoints));
        assertEquals("Required points must be greater than 0", pointsException.getMessage());

        UpdateLoyaltyGiftRequest invalidStock = new UpdateLoyaltyGiftRequest();
        invalidStock.setStock(-1);
        RuntimeException stockException = assertThrows(RuntimeException.class,
                () -> loyaltyGiftService.updateGift(1, invalidStock));
        assertEquals("Stock cannot be negative", stockException.getMessage());
    }

    @Test
    void redeemGift_shouldThrowWhenInactiveOrOutOfStockOrNotEnoughPoints() {
        Customer customer = Customer.builder().id(1).name("Alice").loyaltyPoints(50).build();
        LoyaltyGift inactiveGift = LoyaltyGift.builder().id(2).name("Inactive").requiredPoints(20).stock(1).isActive(false).build();
        LoyaltyGift outOfStockGift = LoyaltyGift.builder().id(3).name("Empty").requiredPoints(20).stock(0).isActive(true).build();
        LoyaltyGift expensiveGift = LoyaltyGift.builder().id(4).name("Expensive").requiredPoints(100).stock(1).isActive(true).build();

        RedeemGiftRequest request = new RedeemGiftRequest();
        request.setCustomerId(1);

        when(customerRepository.findById(1)).thenReturn(Optional.of(customer));

        request.setGiftId(2);
        when(loyaltyGiftRepository.findById(2)).thenReturn(Optional.of(inactiveGift));
        assertEquals("Gift is no longer active", assertThrows(RuntimeException.class, () -> loyaltyGiftService.redeemGift(request)).getMessage());

        request.setGiftId(3);
        when(loyaltyGiftRepository.findById(3)).thenReturn(Optional.of(outOfStockGift));
        assertEquals("Gift is out of stock", assertThrows(RuntimeException.class, () -> loyaltyGiftService.redeemGift(request)).getMessage());

        request.setGiftId(4);
        when(loyaltyGiftRepository.findById(4)).thenReturn(Optional.of(expensiveGift));
        assertTrue(assertThrows(RuntimeException.class, () -> loyaltyGiftService.redeemGift(request))
                .getMessage().contains("Not enough points to redeem this gift"));
    }

    @Test
    void redeemGift_shouldDeductPointsAndStockAndSaveHistory() {
        Product product = Product.builder().id(1).name("Coffee").build();
        ProductVariant variant = ProductVariant.builder().id(5).product(product).sku("GIFT-SKU").build();
        Customer customer = Customer.builder().id(1).name("Alice").loyaltyPoints(120).build();
        LoyaltyGift gift = LoyaltyGift.builder().id(2).variant(variant).name("Gift A").requiredPoints(100).stock(3).isActive(true).build();

        RedeemGiftRequest request = new RedeemGiftRequest();
        request.setCustomerId(1);
        request.setGiftId(2);

        when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
        when(loyaltyGiftRepository.findById(2)).thenReturn(Optional.of(gift));
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(loyaltyGiftRepository.save(any(LoyaltyGift.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(loyaltyTransactionRepository.save(any(LoyaltyTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(historyRepository.save(any(GiftRedemptionHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LoyaltyGiftResponse response = loyaltyGiftService.redeemGift(request);

        assertEquals(20, customer.getLoyaltyPoints());
        assertEquals(2, gift.getStock());
        assertEquals("Gift A", response.getName());

        ArgumentCaptor<LoyaltyTransaction> transactionCaptor = ArgumentCaptor.forClass(LoyaltyTransaction.class);
        verify(loyaltyTransactionRepository).save(transactionCaptor.capture());
        assertEquals("REDEEM", transactionCaptor.getValue().getTransactionType());
        assertEquals(-100, transactionCaptor.getValue().getPoints());

        ArgumentCaptor<GiftRedemptionHistory> historyCaptor = ArgumentCaptor.forClass(GiftRedemptionHistory.class);
        verify(historyRepository).save(historyCaptor.capture());
        assertEquals(100, historyCaptor.getValue().getPointsUsed());
    }

    @Test
    void deleteGift_shouldSoftDeleteGift() {
        ProductVariant variant = ProductVariant.builder().id(1).sku("SKU").build();
        LoyaltyGift gift = LoyaltyGift.builder().id(3).variant(variant).name("Gift").requiredPoints(10).stock(1).isActive(true).build();

        when(loyaltyGiftRepository.findById(3)).thenReturn(Optional.of(gift));
        when(loyaltyGiftRepository.save(gift)).thenReturn(gift);

        loyaltyGiftService.deleteGift(3);

        assertFalse(gift.isActive());
    }

    @Test
    void getCustomerRedemptionHistory_shouldMapHistory() {
        Customer customer = Customer.builder().id(1).name("Alice").build();
        ProductVariant variant = ProductVariant.builder().id(1).sku("SKU").build();
        LoyaltyGift gift = LoyaltyGift.builder().id(2).variant(variant).name("Gift").requiredPoints(20).stock(2).isActive(true).build();
        GiftRedemptionHistory history = GiftRedemptionHistory.builder().id(9).customer(customer).gift(gift).pointsUsed(20).build();

        when(historyRepository.findByCustomerIdOrderByRedeemedAtDesc(1)).thenReturn(List.of(history));

        List<GiftRedemptionHistoryResponse> responses = loyaltyGiftService.getCustomerRedemptionHistory(1);

        assertEquals(1, responses.size());
        assertEquals("Alice", responses.get(0).getCustomerName());
        assertEquals("Gift", responses.get(0).getGiftName());
        assertNotNull(responses.get(0));
    }
}