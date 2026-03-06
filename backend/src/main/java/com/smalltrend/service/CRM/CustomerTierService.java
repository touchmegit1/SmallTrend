package com.smalltrend.service.CRM;

import com.smalltrend.dto.CRM.CustomerTierResponse;
import com.smalltrend.dto.CRM.UpdateCustomerTierRequest;
import com.smalltrend.entity.CustomerTier;
import com.smalltrend.repository.CustomerTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerTierService {

    private final CustomerTierRepository customerTierRepository;

    public List<CustomerTierResponse> getAllTiers() {
        return customerTierRepository.findAllByOrderByPriorityAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CustomerTierResponse updateTier(Integer id, UpdateCustomerTierRequest request) {
        CustomerTier tier = customerTierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer tier not found: " + id));

        if (request.getTierName() != null) tier.setTierName(request.getTierName());
        if (request.getMinSpending() != null) tier.setMinSpending(request.getMinSpending());
        if (request.getPointsMultiplier() != null) tier.setPointsMultiplier(request.getPointsMultiplier());
        if (request.getDiscountRate() != null) tier.setDiscountRate(request.getDiscountRate());
        if (request.getColor() != null) tier.setColor(request.getColor());
        if (request.getDescription() != null) tier.setDescription(request.getDescription());
        if (request.getIsActive() != null) tier.setIsActive(request.getIsActive());

        CustomerTier saved = customerTierRepository.save(tier);
        return mapToResponse(saved);
    }

    private CustomerTierResponse mapToResponse(CustomerTier tier) {
        CustomerTierResponse resp = new CustomerTierResponse();
        resp.setId(tier.getId());
        resp.setTierCode(tier.getTierCode());
        resp.setTierName(tier.getTierName());
        resp.setMinSpending(tier.getMinSpending());
        resp.setPointsMultiplier(tier.getPointsMultiplier());
        resp.setDiscountRate(tier.getDiscountRate());
        resp.setBonusPoints(tier.getBonusPoints());
        resp.setColor(tier.getColor());
        resp.setIsActive(tier.getIsActive());
        resp.setPriority(tier.getPriority());
        resp.setDescription(tier.getDescription());
        return resp;
    }
}
