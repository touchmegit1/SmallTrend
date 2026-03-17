package com.smalltrend.service.crm;

import com.smalltrend.dto.CRM.CouponResponse;
import com.smalltrend.dto.CRM.CreateCouponRequest;
import com.smalltrend.entity.Campaign;
import com.smalltrend.entity.Coupon;
import com.smalltrend.repository.CampaignRepository;
import com.smalltrend.repository.CouponRepository;
import com.smalltrend.service.CRM.CouponService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CampaignRepository campaignRepository;

    @InjectMocks
    private CouponService couponService;

    @Test
    void getAllCoupons_shouldMapCoupons() {
        Coupon coupon = Coupon.builder()
                .id(1)
                .couponCode("WELCOME10")
                .couponName("Welcome")
                .couponType("PERCENTAGE")
                .discountPercent(new BigDecimal("10"))
                .status("ACTIVE")
                .endDate(LocalDate.of(2026, 12, 31))
                .build();

        when(couponRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(coupon));

        List<CouponResponse> responses = couponService.getAllCoupons();

        assertEquals(1, responses.size());
        assertEquals("WELCOME10", responses.get(0).getCouponCode());
    }

    @Test
    void createCoupon_shouldThrowWhenDuplicateCodeExists() {
        CreateCouponRequest request = new CreateCouponRequest();
        request.setCouponCode("DUPLICATE");

        when(couponRepository.existsByCouponCode("DUPLICATE")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> couponService.createCoupon(request));

        assertEquals("Mã coupon đã tồn tại: DUPLICATE", exception.getMessage());
    }

    @Test
    void createCoupon_shouldDefaultStatusAndResolveCampaign() {
        CreateCouponRequest request = new CreateCouponRequest();
        request.setCouponCode("FLASH50");
        request.setCouponName("Flash discount");
        request.setCouponType("FIXED_AMOUNT");
        request.setDiscountAmount(new BigDecimal("50000"));
        request.setEndDate(LocalDate.of(2026, 11, 30));
        request.setCampaignId(3);

        Campaign campaign = Campaign.builder().id(3).campaignName("Flash Sale").build();

        when(couponRepository.existsByCouponCode("FLASH50")).thenReturn(false);
        when(campaignRepository.findById(3)).thenReturn(Optional.of(campaign));
        when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> {
            Coupon coupon = invocation.getArgument(0);
            coupon.setId(10);
            return coupon;
        });

        CouponResponse response = couponService.createCoupon(request);

        assertEquals("DRAFT", response.getStatus());
        assertEquals(3, response.getCampaignId());
        assertEquals("Flash Sale", response.getCampaignName());
    }

    @Test
    void createCoupon_shouldAllowMissingCampaign() {
        CreateCouponRequest request = new CreateCouponRequest();
        request.setCouponCode("SOLO15");
        request.setCouponName("Standalone");
        request.setCouponType("PERCENTAGE");
        request.setDiscountPercent(new BigDecimal("15"));
        request.setEndDate(LocalDate.of(2026, 9, 9));

        when(couponRepository.existsByCouponCode("SOLO15")).thenReturn(false);
        when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> {
            Coupon coupon = invocation.getArgument(0);
            coupon.setId(11);
            return coupon;
        });

        CouponResponse response = couponService.createCoupon(request);

        assertNull(response.getCampaignId());
        assertNull(response.getCampaignName());
    }

    @Test
    void updateCoupon_shouldThrowWhenCouponMissing() {
        when(couponRepository.findById(5)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> couponService.updateCoupon(5, new CreateCouponRequest()));

        assertEquals("Coupon not found: 5", exception.getMessage());
    }

    @Test
    void deleteCoupon_shouldThrowWhenMissing() {
        when(couponRepository.existsById(7)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> couponService.deleteCoupon(7));

        assertEquals("Coupon not found: 7", exception.getMessage());
    }
}