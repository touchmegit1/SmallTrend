package com.smalltrend.controller.products;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.smalltrend.dto.Module1.ProductVariantRespone;
import com.smalltrend.service.Module1.ProductVariantService;

@RestController
@RequestMapping("/api/pos")
public class ProductVariantController {

    private final ProductVariantService productService;

    public ProductVariantController(@Qualifier("variantCouponService") ProductVariantService productService) {
        this.productService = productService;
    }

    /**
     * Lấy tất cả product variants
     */
    @GetMapping("/product")
    // Lấy all product variants.
    public ResponseEntity<List<ProductVariantRespone>> getAllProductVariants() {
        return ResponseEntity.ok(productService.getAllProductVariants());
    }

    /**
     * Lấy chỉ những variant đang có coupon (dùng cho Event Promotion section)
     */
    @GetMapping("/product/with-coupon")
    // Lấy variants with coupon.
    public ResponseEntity<List<ProductVariantRespone>> getVariantsWithCoupon() {
        return ResponseEntity.ok(productService.getVariantsWithCoupon());
    }

    /**
     * Áp coupon cho sản phẩm theo SKU
     */
    @PutMapping("/product/{sku}/coupon/{couponId}")
    // Áp dụng coupon.
    public ResponseEntity<?> applyCoupon(@PathVariable String sku, @PathVariable Integer couponId) {
        try {
            ProductVariantRespone result = productService.applyCoupon(sku, couponId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Xóa coupon khỏi sản phẩm theo SKU
     */
    @DeleteMapping("/product/{sku}/coupon")
    // Gỡ coupon.
    public ResponseEntity<?> removeCoupon(@PathVariable String sku) {
        try {
            ProductVariantRespone result = productService.removeCoupon(sku);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
