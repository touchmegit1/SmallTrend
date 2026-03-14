package com.smalltrend.service.Module1;

import com.smalltrend.repository.CouponRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.entity.Coupon;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.dto.Module1.ProductVariantRespone;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Service("variantCouponService")
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final CouponRepository couponRepository;
    private final ProductBatchRepository productBatchRepository;

    public List<ProductVariantRespone> getAllProductVariants() {
        return productVariantRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    /** Chỉ lấy variant đang có coupon áp dụng (dùng cho Event Promotion) */
    public List<ProductVariantRespone> getVariantsWithCoupon() {
        return productVariantRepository.findAll().stream()
                .filter(v -> v.getCoupon() != null)
                .map(this::mapToResponse)
                .toList();
    }

    /** Áp dụng coupon cho một variant theo SKU */
    public ProductVariantRespone applyCoupon(String sku, Integer couponId) {
        ProductVariant variant = productVariantRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với SKU: " + sku));

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy coupon ID: " + couponId));

        variant.setCoupon(coupon);
        return mapToResponse(productVariantRepository.save(variant));
    }

    /** Xóa coupon khỏi một variant theo SKU */
    public ProductVariantRespone removeCoupon(String sku) {
        ProductVariant variant = productVariantRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với SKU: " + sku));

        variant.setCoupon(null);
        return mapToResponse(productVariantRepository.save(variant));
    }

    // ─── Mapper ──────────────────────────────────────────────────────────────
    private ProductVariantRespone mapToResponse(ProductVariant variant) {
        ProductVariantRespone r = new ProductVariantRespone();
        r.setId(variant.getId());
        r.setSku(variant.getSku());
        r.setBarcode(variant.getBarcode());

        String productName = variant.getProduct() != null ? variant.getProduct().getName() : "";
        StringBuilder nameBuilder = new StringBuilder(productName);

        String unitNameStr = variant.getUnit() != null ? variant.getUnit().getName() : "";

        if (unitNameStr != null && !unitNameStr.trim().isEmpty()) {
            nameBuilder.append(" ");
            nameBuilder.append(unitNameStr.trim());
        }

        java.util.Map<String, String> attributes = variant.getAttributes();
        if (attributes != null && !attributes.isEmpty()) {
            for (String value : attributes.values()) {
                if (value != null && !value.trim().isEmpty()) {
                    nameBuilder.append(" - ").append(value.trim());
                }
            }
        }

        r.setName(nameBuilder.toString());
        r.setSellPrice(variant.getSellPrice());
        r.setActive(variant.isActive());
        r.setAttributes(variant.getAttributes());

        // Cost info (from latest batch)
        List<ProductBatch> batches = productBatchRepository.findByVariantId(variant.getId());
        if (batches != null && !batches.isEmpty()) {
            ProductBatch latestBatch = batches.get(batches.size() - 1);
            r.setCostPrice(latestBatch.getCostPrice());
        }

        // Ảnh: ưu tiên ảnh variant, fallback ảnh product
        String img = variant.getImageUrl();
        if ((img == null || img.isBlank()) && variant.getProduct() != null) {
            img = variant.getProduct().getImageUrl();
        }
        r.setImageUrl(img);

        // Tax info
        if (variant.getProduct() != null && variant.getProduct().getTaxRate() != null) {
            r.setTaxRate(variant.getProduct().getTaxRate().getRate());
            r.setTaxName(variant.getProduct().getTaxRate().getName());
        }

        // Coupon info
        Coupon c = variant.getCoupon();
        if (c != null) {
            r.setCouponId(c.getId());
            r.setCouponCode(c.getCouponCode());
            r.setCouponName(c.getCouponName());
            r.setCouponType(c.getCouponType());
            r.setDiscountPercent(c.getDiscountPercent());
            r.setDiscountAmount(c.getDiscountAmount());

            // Tính giá sau giảm
            BigDecimal price = variant.getSellPrice();
            if (price != null) {
                if ("PERCENTAGE".equals(c.getCouponType()) && c.getDiscountPercent() != null) {
                    BigDecimal discount = price.multiply(c.getDiscountPercent()).divide(BigDecimal.valueOf(100));
                    BigDecimal discounted = price.subtract(discount);
                    // Áp giảm tối đa nếu có
                    if (c.getMaxDiscountAmount() != null && discount.compareTo(c.getMaxDiscountAmount()) > 0) {
                        discounted = price.subtract(c.getMaxDiscountAmount());
                    }
                    r.setDiscountedPrice(discounted.max(BigDecimal.ZERO));
                } else if ("FIXED_AMOUNT".equals(c.getCouponType()) && c.getDiscountAmount() != null) {
                    r.setDiscountedPrice(price.subtract(c.getDiscountAmount()).max(BigDecimal.ZERO));
                } else {
                    r.setDiscountedPrice(price);
                }
            }
        }

        return r;
    }
}
