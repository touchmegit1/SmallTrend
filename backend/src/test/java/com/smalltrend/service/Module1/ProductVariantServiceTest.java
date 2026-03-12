package com.smalltrend.service.Module1;

import com.smalltrend.dto.Module1.ProductVariantRespone;
import com.smalltrend.entity.Coupon;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.TaxRate;
import com.smalltrend.entity.Unit;
import com.smalltrend.repository.CouponRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.repository.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class ProductVariantServiceTest {

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private ProductBatchRepository productBatchRepository;

    private ProductVariantService productVariantService;

    @BeforeEach
    void setUp() {
        productVariantService = new ProductVariantService(productVariantRepository, couponRepository, productBatchRepository);
    }

    private ProductVariant createMockVariant() {
        Product product = new Product();
        product.setId(1);
        product.setName("Binh Nuoc");
        TaxRate tax = new TaxRate();
        tax.setRate(new BigDecimal("10.0"));
        tax.setName("VAT 10%");
        product.setTaxRate(tax);

        Unit unit = new Unit();
        unit.setId(1);
        unit.setName("Cai");

        ProductVariant variant = new ProductVariant();
        variant.setId(100);
        variant.setSku("SKU-001");
        variant.setBarcode("BAR-001");
        variant.setProduct(product);
        variant.setUnit(unit);
        variant.setAttributes(Map.of("Color", "Do"));
        variant.setSellPrice(new BigDecimal("100000"));
        variant.setActive(true);

        return variant;
    }

    @Test
    void getAllProductVariants_shouldReturnMappedList() {
        ProductVariant variant = createMockVariant();
        when(productVariantRepository.findAll()).thenReturn(List.of(variant));
        
        ProductBatch batch = new ProductBatch();
        batch.setCostPrice(new BigDecimal("50000"));
        when(productBatchRepository.findByVariantId(100)).thenReturn(List.of(batch));

        List<ProductVariantRespone> responses = productVariantService.getAllProductVariants();

        assertEquals(1, responses.size());
        ProductVariantRespone response = responses.get(0);
        assertEquals(100, response.getId());
        assertEquals("SKU-001", response.getSku());
        assertEquals("BAR-001", response.getBarcode());
        assertEquals("Binh Nuoc Cai - Do", response.getName());
        assertEquals(new BigDecimal("100000"), response.getSellPrice());
        assertEquals(new BigDecimal("50000"), response.getCostPrice());
        assertEquals(new BigDecimal("10.0"), response.getTaxRate());
    }

    @Test
    void getVariantsWithCoupon_shouldReturnOnlyVariantsWithCoupon() {
        ProductVariant variantWithCoupon = createMockVariant();
        Coupon coupon = new Coupon();
        coupon.setId(1);
        variantWithCoupon.setCoupon(coupon);

        ProductVariant variantNoCoupon = createMockVariant();
        variantNoCoupon.setId(101);

        when(productVariantRepository.findAll()).thenReturn(List.of(variantWithCoupon, variantNoCoupon));

        List<ProductVariantRespone> responses = productVariantService.getVariantsWithCoupon();

        assertEquals(1, responses.size());
        assertEquals(100, responses.get(0).getId());
    }

    @Test
    void applyCoupon_shouldApplyCouponAndReturnUpdatedVariant_whenValid() {
        ProductVariant variant = createMockVariant();
        when(productVariantRepository.findBySku("SKU-001")).thenReturn(Optional.of(variant));

        Coupon coupon = new Coupon();
        coupon.setId(99);
        coupon.setCouponType("PERCENTAGE");
        coupon.setDiscountPercent(new BigDecimal("20"));
        when(couponRepository.findById(99)).thenReturn(Optional.of(coupon));

        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductVariantRespone response = productVariantService.applyCoupon("SKU-001", 99);

        assertNotNull(response);
        assertEquals(99, response.getCouponId());
        // Original price 100k, 20% discount -> 80k
        assertEquals(0, new BigDecimal("80000").compareTo(response.getDiscountedPrice()));
        verify(productVariantRepository).save(variant);
    }

    @Test
    void applyCoupon_shouldThrowException_whenSkuNotFound() {
        when(productVariantRepository.findBySku("INVALID")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> productVariantService.applyCoupon("INVALID", 99));
        assertEquals("Không tìm thấy sản phẩm với SKU: INVALID", exception.getMessage());
        verify(productVariantRepository, never()).save(any());
    }

    @Test
    void applyCoupon_shouldThrowException_whenCouponNotFound() {
        ProductVariant variant = createMockVariant();
        when(productVariantRepository.findBySku("SKU-001")).thenReturn(Optional.of(variant));
        when(couponRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> productVariantService.applyCoupon("SKU-001", 99));
        assertEquals("Không tìm thấy coupon ID: 99", exception.getMessage());
        verify(productVariantRepository, never()).save(any());
    }

    @Test
    void removeCoupon_shouldRemoveCouponAndReturnUpdatedVariant() {
        ProductVariant variant = createMockVariant();
        Coupon coupon = new Coupon();
        coupon.setId(99);
        variant.setCoupon(coupon);
        
        when(productVariantRepository.findBySku("SKU-001")).thenReturn(Optional.of(variant));
        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductVariantRespone response = productVariantService.removeCoupon("SKU-001");

        assertNotNull(response);
        assertNull(response.getCouponId());
        verify(productVariantRepository).save(variant);
    }

    @Test
    void removeCoupon_shouldThrowException_whenSkuNotFound() {
        when(productVariantRepository.findBySku("INVALID")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> productVariantService.removeCoupon("INVALID"));
        assertEquals("Không tìm thấy sản phẩm với SKU: INVALID", exception.getMessage());
        verify(productVariantRepository, never()).save(any());
    }
}
