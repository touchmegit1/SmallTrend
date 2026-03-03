package com.smalltrend.service.CRM;

import com.smalltrend.dto.CRM.CreateLoyaltyGiftRequest;
import com.smalltrend.dto.CRM.LoyaltyGiftResponse;
import com.smalltrend.dto.CRM.RedeemGiftRequest;
import com.smalltrend.dto.CRM.GiftRedemptionHistoryResponse;
import com.smalltrend.entity.Customer;
import com.smalltrend.entity.GiftRedemptionHistory;
import com.smalltrend.entity.LoyaltyGift;
import com.smalltrend.entity.LoyaltyTransaction;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.repository.CustomerRepository;
import com.smalltrend.repository.GiftRedemptionHistoryRepository;
import com.smalltrend.repository.LoyaltyGiftRepository;
import com.smalltrend.repository.LoyaltyTransactionRepository;
import com.smalltrend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoyaltyGiftService {

    private final LoyaltyGiftRepository loyaltyGiftRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CustomerRepository customerRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final GiftRedemptionHistoryRepository historyRepository;

    public List<LoyaltyGiftResponse> getAllActiveGifts() {
        return loyaltyGiftRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LoyaltyGiftResponse createGift(CreateLoyaltyGiftRequest request) {
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Product variant not found"));

        LoyaltyGift gift = LoyaltyGift.builder()
                .variant(variant)
                .name(request.getName())
                .requiredPoints(request.getRequiredPoints())
                .stock(request.getStock())
                .isActive(true)
                .build();

        LoyaltyGift saved = loyaltyGiftRepository.save(gift);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteGift(Integer id) {
        LoyaltyGift gift = loyaltyGiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gift not found"));
        gift.setActive(false);
        loyaltyGiftRepository.save(gift);
    }

    @Transactional
    public LoyaltyGiftResponse redeemGift(RedeemGiftRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        LoyaltyGift gift = loyaltyGiftRepository.findById(request.getGiftId())
                .orElseThrow(() -> new RuntimeException("Gift not found"));

        if (!gift.isActive()) {
            throw new RuntimeException("Gift is no longer active");
        }

        if (gift.getStock() <= 0) {
            throw new RuntimeException("Gift is out of stock");
        }

        if (customer.getLoyaltyPoints() < gift.getRequiredPoints()) {
            throw new RuntimeException("Not enough points to redeem this gift. Required: " + gift.getRequiredPoints() + ", Current: " + customer.getLoyaltyPoints());
        }

        // 1. Deduct points from customer
        int pointsBefore = customer.getLoyaltyPoints();
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() - gift.getRequiredPoints());
        customerRepository.save(customer);

        // 2. Reduce gift stock
        gift.setStock(gift.getStock() - 1);
        loyaltyGiftRepository.save(gift);

        // 3. Log point transaction
        LoyaltyTransaction transaction = LoyaltyTransaction.builder()
                .transactionCode("REDEEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customer(customer)
                .transactionType("REDEEM")
                .points(-gift.getRequiredPoints())
                .balanceBefore(pointsBefore)
                .balanceAfter(customer.getLoyaltyPoints())
                .reason("GIFT_REDEMPTION")
                .description("Redeemed gift: " + gift.getName())
                .status("COMPLETED")
                .transactionTime(LocalDateTime.now())
                .build();
        loyaltyTransactionRepository.save(transaction);

        // 4. Save to GiftRedemptionHistory
        GiftRedemptionHistory history = GiftRedemptionHistory.builder()
                .customer(customer)
                .gift(gift)
                .pointsUsed(gift.getRequiredPoints())
                .build();
        historyRepository.save(history);

        return mapToResponse(gift);
    }

    public List<GiftRedemptionHistoryResponse> getCustomerRedemptionHistory(Integer customerId) {
        return historyRepository.findByCustomerIdOrderByRedeemedAtDesc(customerId)
                .stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    private GiftRedemptionHistoryResponse mapToHistoryResponse(GiftRedemptionHistory history) {
        GiftRedemptionHistoryResponse response = new GiftRedemptionHistoryResponse();
        response.setId(history.getId());
        response.setCustomerId(history.getCustomer().getId());
        response.setCustomerName(history.getCustomer().getName());
        response.setGiftId(history.getGift().getId());
        response.setGiftName(history.getGift().getName());
        response.setPointsUsed(history.getPointsUsed());
        response.setRedeemedAt(history.getRedeemedAt());
        return response;
    }

    private LoyaltyGiftResponse mapToResponse(LoyaltyGift gift) {
        LoyaltyGiftResponse response = new LoyaltyGiftResponse();
        response.setId(gift.getId());
        response.setVariantId(gift.getVariant().getId());
        
        // Eager load related Product for name
        if (gift.getVariant().getProduct() != null) {
            response.setProductName(gift.getVariant().getProduct().getName());
        }
        
        response.setSku(gift.getVariant().getSku());
        
        // Use variant image or fallback to product image
        if (gift.getVariant().getImageUrl() != null && !gift.getVariant().getImageUrl().isEmpty()) {
            response.setImage(gift.getVariant().getImageUrl());
        } else if (gift.getVariant().getProduct() != null) {
            response.setImage(gift.getVariant().getProduct().getImageUrl());
        }
        
        response.setName(gift.getName());
        response.setRequiredPoints(gift.getRequiredPoints());
        response.setStock(gift.getStock());
        response.setActive(gift.isActive());
        response.setCreatedAt(gift.getCreatedAt());
        return response;
    }
}
