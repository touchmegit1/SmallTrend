package com.smalltrend.controller.crm;

import com.smalltrend.controller.CRM.CouponController;
import com.smalltrend.dto.CRM.CouponResponse;
import com.smalltrend.dto.CRM.CreateCouponRequest;
import com.smalltrend.service.CRM.CouponService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponControllerTest {

    @Mock
    private CouponService couponService;

    private CouponController controller;

    @BeforeEach
    void setUp() {
        controller = new CouponController(couponService);
    }

    @Test
    void getAllCoupons_shouldReturnOk() {
        List<CouponResponse> expected = List.of(new CouponResponse());
        when(couponService.getAllCoupons()).thenReturn(expected);

        ResponseEntity<List<CouponResponse>> response = controller.getAllCoupons();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void createCoupon_shouldReturnCreated() {
        CreateCouponRequest request = new CreateCouponRequest();
        CouponResponse expected = new CouponResponse();
        when(couponService.createCoupon(request)).thenReturn(expected);

        ResponseEntity<?> response = controller.createCoupon(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void createCoupon_shouldReturnBadRequestOnException() {
        CreateCouponRequest request = new CreateCouponRequest();
        when(couponService.createCoupon(request)).thenThrow(new RuntimeException("duplicate"));

        ResponseEntity<?> response = controller.createCoupon(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("duplicate", ((Map<?, ?>) response.getBody()).get("message"));
    }

    @Test
    void deleteCoupon_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.deleteCoupon(7);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(couponService).deleteCoupon(7);
    }
}