package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.CreateVariantRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.dto.pos.ProductVariantRespone;
import com.smalltrend.entity.Unit;
import com.smalltrend.service.products.ProductService;
import com.smalltrend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các HTTP request liên quan đến Product (Sản phẩm)
 * Cung cấp các RESTful API cho sản phẩm và các biến thể (variants) của nó
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ProductController {

    private final ProductService productService;
    private final ProductVariantService productVariantService;

    // Lấy danh sách tất cả sản phẩm
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    // Lấy thông tin chi tiết một sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    // Lấy danh sách các biến thể (variants) của một sản phẩm
    @GetMapping("/{id}/variants")
    public ResponseEntity<List<ProductVariantRespone>> getVariantsByProductId(@PathVariable Integer id) {
        return ResponseEntity.ok(productVariantService.getVariantsByProductId(id));
    }

    // Tạo mới một biến thể cho sản phẩm
    @PostMapping("/{id}/variants")
    public ResponseEntity<ProductVariantRespone> createVariant(
            @PathVariable Integer id,
            @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(productVariantService.createVariant(id, request));
    }

    // Cập nhật thông tin của một biến thể
    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ProductVariantRespone> updateVariant(
            @PathVariable Integer variantId,
            @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(productVariantService.updateVariant(variantId, request));
    }

    // Bật/Tắt trạng thái hoạt động (active/inactive) của một biến thể
    @PutMapping("/variants/{variantId}/toggle-status")
    public ResponseEntity<String> toggleVariantStatus(@PathVariable Integer variantId) {
        productVariantService.toggleVariantStatus(variantId);
        return ResponseEntity.ok("Variant status toggled");
    }

    // Lấy danh sách tất cả các đơn vị tính có trong hệ thống
    @GetMapping("/units")
    public ResponseEntity<List<Unit>> getAllUnits() {
        return ResponseEntity.ok(productVariantService.getAllUnits());
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    // Cập nhật thông tin của một sản phẩm hiện có
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Integer id, @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    // Bật/Tắt trạng thái hoạt động của một sản phẩm
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<String> toggleStatus(@PathVariable Integer id) {
        productService.toggleStatus(id);
        return ResponseEntity.ok("Product status toggled");
    }

    // Xóa một sản phẩm theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.ok("Product deleted");
    }
}
