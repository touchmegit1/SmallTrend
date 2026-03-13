package com.smalltrend.service;

import com.smalltrend.dto.products.VariantPriceRequest;
import com.smalltrend.dto.products.VariantPriceResponse;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.VariantPrice;
import com.smalltrend.entity.enums.VariantPriceStatus;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.VariantPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VariantPriceService {

    private final VariantPriceRepository variantPriceRepository;
    private final ProductVariantRepository productVariantRepository;

    /**
     * Tạo giá mới cho variant.
     * Tất cả giá cũ đang ACTIVE sẽ chuyển sang INACTIVE.
     */
    @Transactional
    public VariantPriceResponse createPrice(Integer variantId, VariantPriceRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        // Validate
        if (request.getSellingPrice() == null) {
            throw new RuntimeException("Giá bán là bắt buộc.");
        }
        if (request.getEffectiveDate() == null) {
            throw new RuntimeException("Ngày hiệu lực là bắt buộc.");
        }

        // Deactivate all current ACTIVE prices for this variant
        List<VariantPrice> activePrices = variantPriceRepository.findByVariantIdAndStatus(
                variantId, VariantPriceStatus.ACTIVE);
        for (VariantPrice activePrice : activePrices) {
            activePrice.setStatus(VariantPriceStatus.INACTIVE);
            variantPriceRepository.save(activePrice);
        }

        // Create new ACTIVE price
        VariantPrice newPrice = VariantPrice.builder()
                .variant(variant)
                .purchasePrice(request.getPurchasePrice())
                .sellingPrice(request.getSellingPrice())
                .taxPercent(request.getTaxPercent())
                .effectiveDate(request.getEffectiveDate())
                .expiryDate(request.getExpiryDate())
                .status(VariantPriceStatus.ACTIVE)
                .build();

        VariantPrice saved = variantPriceRepository.save(newPrice);
        return mapToResponse(saved);
    }

    /**
     * Lấy lịch sử giá của variant (mới nhất trước).
     */
    public List<VariantPriceResponse> getPriceHistory(Integer variantId) {
        return variantPriceRepository.findByVariantIdOrderByCreatedAtDesc(variantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy giá đang ACTIVE của variant.
     */
    public VariantPriceResponse getActivePrice(Integer variantId) {
        return variantPriceRepository.findFirstByVariantIdAndStatus(variantId, VariantPriceStatus.ACTIVE)
                .map(this::mapToResponse)
                .orElse(null);
    }

    /**
     * Cập nhật ngày hiệu lực của giá đang ACTIVE.
     */
    @Transactional
    public VariantPriceResponse updateActivePriceDate(Integer variantId, java.time.LocalDate newDate) {
        VariantPrice activePrice = variantPriceRepository.findFirstByVariantIdAndStatus(variantId, VariantPriceStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active price found for variant " + variantId));

        activePrice.setEffectiveDate(newDate);
        VariantPrice saved = variantPriceRepository.save(activePrice);
        return mapToResponse(saved);
    }

    /**
     * Cập nhật ngày hết hiệu lực của giá đang ACTIVE (nullable).
     */
    @Transactional
    public VariantPriceResponse updateActivePriceExpiry(Integer variantId, java.time.LocalDate newDate) {
        VariantPrice activePrice = variantPriceRepository.findFirstByVariantIdAndStatus(variantId, VariantPriceStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active price found for variant " + variantId));

        activePrice.setExpiryDate(newDate);
        VariantPrice saved = variantPriceRepository.save(activePrice);
        return mapToResponse(saved);
    }

    /**
     * Toggle trạng thái active/inactive cho một bản ghi giá.
     * Nếu kích hoạt một giá, tất cả giá khác của variant sẽ bị INACTIVE.
     */
    @Transactional
    public VariantPriceResponse togglePriceStatus(Integer priceId) {
        VariantPrice price = variantPriceRepository.findById(priceId)
                .orElseThrow(() -> new RuntimeException("Price not found with id: " + priceId));

        if (price.getStatus() == VariantPriceStatus.ACTIVE) {
            // Deactivate this price
            price.setStatus(VariantPriceStatus.INACTIVE);
        } else {
            // Activate this price → deactivate all others for the same variant
            List<VariantPrice> activePrices = variantPriceRepository.findByVariantIdAndStatus(
                    price.getVariant().getId(), VariantPriceStatus.ACTIVE);
            for (VariantPrice activePrice : activePrices) {
                activePrice.setStatus(VariantPriceStatus.INACTIVE);
                variantPriceRepository.save(activePrice);
            }
            price.setStatus(VariantPriceStatus.ACTIVE);
        }

        VariantPrice saved = variantPriceRepository.save(price);
        return mapToResponse(saved);
    }

    // ─── Mapper ──────────────────────────────────────────────────────────────

    private VariantPriceResponse mapToResponse(VariantPrice entity) {
        VariantPriceResponse response = new VariantPriceResponse();
        response.setId(entity.getId());
        response.setVariantId(entity.getVariant().getId());
        response.setPurchasePrice(entity.getPurchasePrice());
        response.setSellingPrice(entity.getSellingPrice());
        response.setTaxPercent(entity.getTaxPercent());
        response.setEffectiveDate(entity.getEffectiveDate());
        response.setExpiryDate(entity.getExpiryDate());
        response.setStatus(entity.getStatus().name());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}
