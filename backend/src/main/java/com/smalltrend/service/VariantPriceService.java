package com.smalltrend.service;

import com.smalltrend.dto.inventory.dashboard.PriceExpiryAlertResponse;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import static com.smalltrend.entity.enums.VariantPriceStatus.ACTIVE;

/**
 * Service quản lý vòng đời giá của Product Variant.
 * Quy tắc chính: mỗi variant chỉ nên có 1 bản ghi giá ACTIVE tại một thời điểm.
 */
@Service
@RequiredArgsConstructor
public class VariantPriceService {

    private final VariantPriceRepository variantPriceRepository;
    private final ProductVariantRepository productVariantRepository;

    /**
     * Tạo giá mới cho variant. Tất cả giá cũ đang ACTIVE sẽ chuyển sang
     * INACTIVE.
     */
    @Transactional
    public VariantPriceResponse createPrice(Integer variantId, VariantPriceRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        BigDecimal purchasePrice = normalizePurchasePrice(request.getPurchasePrice());
        BigDecimal taxPercent = normalizeTaxPercent(request.getTaxPercent());
        BigDecimal baseSellingPrice = normalizeBaseSellingPrice(request, taxPercent);
        LocalDate effectiveDate = requireEffectiveDate(request.getEffectiveDate());
        LocalDate expiryDate = request.getExpiryDate();

        validateDateRange(effectiveDate, expiryDate);
        validateProfitRule(baseSellingPrice, purchasePrice);

        BigDecimal finalSellingPrice = calculateFinalSellingPrice(baseSellingPrice, taxPercent);

        // Deactivate all current ACTIVE prices for this variant
        List<VariantPrice> activePrices = variantPriceRepository.findByVariantIdAndStatus(variantId, ACTIVE);
        for (VariantPrice activePrice : activePrices) {
            activePrice.setStatus(VariantPriceStatus.INACTIVE);
            variantPriceRepository.save(activePrice);
        }

        // Create new ACTIVE price
        VariantPrice newPrice = VariantPrice.builder()
                .variant(variant)
                .purchasePrice(purchasePrice)
                .baseSellingPrice(baseSellingPrice)
                .sellingPrice(finalSellingPrice)
                .taxPercent(taxPercent)
                .effectiveDate(effectiveDate)
                .expiryDate(expiryDate)
                .status(VariantPriceStatus.ACTIVE)
                .build();

        VariantPrice saved = variantPriceRepository.save(newPrice);

        // Sync to ProductVariant
        variant.setSellPrice(saved.getSellingPrice());
        productVariantRepository.save(variant);

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
        return variantPriceRepository.findFirstByVariantIdAndStatus(variantId, ACTIVE)
                .map(this::mapToResponse)
                .orElse(null);
    }

    /**
     * Đồng bộ giá nhập vào bản ghi giá đang ACTIVE (nếu có).
     * Trả về false khi thiếu dữ liệu hoặc variant chưa có giá ACTIVE.
     */
    @Transactional
    public boolean syncActivePurchasePrice(Integer variantId, BigDecimal purchasePrice) {
        if (purchasePrice == null) {
            return false;
        }

        VariantPrice activePrice = variantPriceRepository
                .findFirstByVariantIdAndStatus(variantId, ACTIVE)
                .orElse(null);
        if (activePrice == null) {
            return false;
        }

        activePrice.setPurchasePrice(purchasePrice);
        variantPriceRepository.save(activePrice);
        return true;
    }

    /**
     * Cập nhật ngày hiệu lực của giá đang ACTIVE.
     */
    @Transactional
    public VariantPriceResponse updateActivePriceDate(Integer variantId, java.time.LocalDate newDate) {
        VariantPrice activePrice = variantPriceRepository.findFirstByVariantIdAndStatus(variantId, VariantPriceStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active price found for variant " + variantId));

        LocalDate effectiveDate = requireEffectiveDate(newDate);
        validateDateRange(effectiveDate, activePrice.getExpiryDate());

        activePrice.setEffectiveDate(effectiveDate);
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

        validateDateRange(activePrice.getEffectiveDate(), newDate);

        activePrice.setExpiryDate(newDate);
        VariantPrice saved = variantPriceRepository.save(activePrice);
        return mapToResponse(saved);
    }

    /**
     * Toggle trạng thái active/inactive cho một bản ghi giá. Nếu kích hoạt một
     * giá, tất cả giá khác của variant sẽ bị INACTIVE.
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

        // Sync to ProductVariant
        ProductVariant variant = price.getVariant();
        if (saved.getStatus() == VariantPriceStatus.ACTIVE) {
            variant.setSellPrice(saved.getSellingPrice());
        } else {
            // Need to set to 0 or null if no active price?
            // Actually, if we deactivate, we should probably find if there's any other active (which there shouldn't be).
            // Defaulting to 0 for safety when no price is active.
            variant.setSellPrice(java.math.BigDecimal.ZERO);
        }
        productVariantRepository.save(variant);

        return mapToResponse(saved);
    }

    /**
     * Lấy danh sách giá ACTIVE sắp hết hiệu lực theo số ngày cảnh báo.
     */
    public List<PriceExpiryAlertResponse> getPriceExpiryAlerts(int daysBeforeExpiry) {
        LocalDate today = LocalDate.now();
        LocalDate targetDate = today.plusDays(daysBeforeExpiry);

        return variantPriceRepository.findByStatusAndExpiryDateWithVariant(VariantPriceStatus.ACTIVE, targetDate)
                .stream()
                .map(vp -> {
                    String variantName = "N/A";
                    if (vp.getVariant() != null && vp.getVariant().getProduct() != null) {
                        variantName = vp.getVariant().getProduct().getName();
                    }

                    return PriceExpiryAlertResponse.builder()
                            .variantPriceId(vp.getId())
                            .variantId(vp.getVariant() != null ? vp.getVariant().getId() : null)
                            .variantName(variantName)
                            .sku(vp.getVariant() != null ? vp.getVariant().getSku() : null)
                            .activeSellingPrice(vp.getSellingPrice())
                            .expiryDate(vp.getExpiryDate())
                            .daysUntilExpiry((int) ChronoUnit.DAYS.between(today, vp.getExpiryDate()))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private BigDecimal normalizePurchasePrice(BigDecimal purchasePrice) {
        if (purchasePrice == null) {
            return BigDecimal.ZERO;
        }
        if (purchasePrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giá nhập không được âm.");
        }
        return purchasePrice;
    }

    private BigDecimal normalizeTaxPercent(BigDecimal taxPercent) {
        BigDecimal normalized = taxPercent == null ? BigDecimal.ZERO : taxPercent;
        if (normalized.compareTo(BigDecimal.ZERO) < 0 || normalized.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Thuế suất phải nằm trong khoảng từ 0 đến 100.");
        }
        return normalized;
    }

    private BigDecimal normalizeBaseSellingPrice(VariantPriceRequest request, BigDecimal taxPercent) {
        if (request.getBaseSellingPrice() != null) {
            if (request.getBaseSellingPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Giá bán trước VAT phải lớn hơn 0.");
            }
            return request.getBaseSellingPrice();
        }

        if (request.getSellingPrice() == null || request.getSellingPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Giá bán trước VAT là bắt buộc.");
        }

        BigDecimal divisor = BigDecimal.ONE.add(taxPercent.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
        return request.getSellingPrice().divide(divisor, 0, RoundingMode.HALF_UP);
    }

    private LocalDate requireEffectiveDate(LocalDate effectiveDate) {
        if (effectiveDate == null) {
            throw new RuntimeException("Ngày hiệu lực là bắt buộc.");
        }
        return effectiveDate;
    }

    private void validateDateRange(LocalDate effectiveDate, LocalDate expiryDate) {
        if (effectiveDate != null && expiryDate != null && expiryDate.isBefore(effectiveDate)) {
            throw new RuntimeException("Ngày hết hiệu lực phải lớn hơn hoặc bằng ngày hiệu lực.");
        }
    }

    private void validateProfitRule(BigDecimal baseSellingPrice, BigDecimal purchasePrice) {
        if (baseSellingPrice.compareTo(purchasePrice) < 0) {
            throw new RuntimeException("Giá bán trước VAT không được thấp hơn giá nhập.");
        }
    }

    private BigDecimal calculateFinalSellingPrice(BigDecimal baseSellingPrice, BigDecimal taxPercent) {
        BigDecimal vatAmount = baseSellingPrice.multiply(taxPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal rawFinalPrice = baseSellingPrice.add(vatAmount);
        return roundToNearestStep(rawFinalPrice, BigDecimal.valueOf(100));
    }

    private BigDecimal roundToNearestStep(BigDecimal value, BigDecimal step) {
        if (step == null || step.compareTo(BigDecimal.ZERO) <= 0) {
            return value;
        }
        return value.divide(step, 0, RoundingMode.HALF_UP).multiply(step);
    }

    private BigDecimal calculateVatAmount(BigDecimal baseSellingPrice, BigDecimal finalSellingPrice) {
        if (baseSellingPrice == null || finalSellingPrice == null) {
            return BigDecimal.ZERO;
        }
        return finalSellingPrice.subtract(baseSellingPrice);
    }

    // ─── Mapper ──────────────────────────────────────────────────────────────
    private VariantPriceResponse mapToResponse(VariantPrice entity) {
        VariantPriceResponse response = new VariantPriceResponse();
        response.setId(entity.getId());
        response.setVariantId(entity.getVariant().getId());
        response.setPurchasePrice(entity.getPurchasePrice());
        response.setBaseSellingPrice(entity.getBaseSellingPrice());
        response.setSellingPrice(entity.getSellingPrice());
        response.setTaxPercent(entity.getTaxPercent());
        response.setVatAmount(calculateVatAmount(entity.getBaseSellingPrice(), entity.getSellingPrice()));
        response.setEffectiveDate(entity.getEffectiveDate());
        response.setExpiryDate(entity.getExpiryDate());
        response.setStatus(entity.getStatus().name());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}
