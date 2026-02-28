package com.smalltrend.service.CRM;

import com.smalltrend.dto.CRM.CouponResponse;
import com.smalltrend.dto.CRM.CreateCouponRequest;
import com.smalltrend.entity.Campaign;
import com.smalltrend.entity.Coupon;
import com.smalltrend.repository.CampaignRepository;
import com.smalltrend.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CampaignRepository campaignRepository;

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).toList();
    }

    public CouponResponse createCoupon(CreateCouponRequest request) {
        if (couponRepository.existsByCouponCode(request.getCouponCode())) {
            throw new RuntimeException("Mã coupon đã tồn tại: " + request.getCouponCode());
        }

        Campaign campaign = null;
        if (request.getCampaignId() != null) {
            campaign = campaignRepository.findById(request.getCampaignId()).orElse(null);
        }

        Coupon coupon = Coupon.builder()
                .couponCode(request.getCouponCode())
                .couponName(request.getCouponName())
                .description(request.getDescription())
                .couponType(request.getCouponType())
                .discountPercent(request.getDiscountPercent())
                .discountAmount(request.getDiscountAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minPurchaseAmount(request.getMinPurchaseAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalUsageLimit(request.getTotalUsageLimit())
                .usagePerCustomer(request.getUsagePerCustomer())
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .campaign(campaign)
                .build();

        return mapToResponse(couponRepository.save(coupon));
    }

    public CouponResponse updateCoupon(Integer id, CreateCouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found: " + id));

        Campaign campaign = null;
        if (request.getCampaignId() != null) {
            campaign = campaignRepository.findById(request.getCampaignId()).orElse(null);
        }

        coupon.setCouponName(request.getCouponName());
        coupon.setDescription(request.getDescription());
        coupon.setCouponType(request.getCouponType());
        coupon.setDiscountPercent(request.getDiscountPercent());
        coupon.setDiscountAmount(request.getDiscountAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setMinPurchaseAmount(request.getMinPurchaseAmount());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setTotalUsageLimit(request.getTotalUsageLimit());
        coupon.setUsagePerCustomer(request.getUsagePerCustomer());
        coupon.setStatus(request.getStatus());
        coupon.setCampaign(campaign);

        return mapToResponse(couponRepository.save(coupon));
    }

    public void deleteCoupon(Integer id) {
        if (!couponRepository.existsById(id))
            throw new RuntimeException("Coupon not found: " + id);
        couponRepository.deleteById(id);
    }

    private CouponResponse mapToResponse(Coupon c) {
        CouponResponse r = new CouponResponse();
        r.setId(c.getId());
        r.setCouponCode(c.getCouponCode());
        r.setCouponName(c.getCouponName());
        r.setDescription(c.getDescription());
        r.setCouponType(c.getCouponType());
        r.setDiscountPercent(c.getDiscountPercent());
        r.setDiscountAmount(c.getDiscountAmount());
        r.setMaxDiscountAmount(c.getMaxDiscountAmount());
        r.setMinPurchaseAmount(c.getMinPurchaseAmount());
        r.setStartDate(c.getStartDate());
        r.setEndDate(c.getEndDate());
        r.setTotalUsageLimit(c.getTotalUsageLimit());
        r.setUsagePerCustomer(c.getUsagePerCustomer());
        r.setCurrentUsageCount(c.getCurrentUsageCount());
        r.setStatus(c.getStatus());
        if (c.getCampaign() != null) {
            r.setCampaignId(c.getCampaign().getId());
            r.setCampaignName(c.getCampaign().getCampaignName());
        }
        return r;
    }
}
