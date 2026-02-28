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

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ProductController {

    private final ProductService productService;
    private final ProductVariantService productVariantService;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/{id}/variants")
    public ResponseEntity<List<ProductVariantRespone>> getVariantsByProductId(@PathVariable Integer id) {
        return ResponseEntity.ok(productVariantService.getVariantsByProductId(id));
    }

    @PostMapping("/{id}/variants")
    public ResponseEntity<ProductVariantRespone> createVariant(
            @PathVariable Integer id,
            @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(productVariantService.createVariant(id, request));
    }

    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ProductVariantRespone> updateVariant(
            @PathVariable Integer variantId,
            @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(productVariantService.updateVariant(variantId, request));
    }

    @PutMapping("/variants/{variantId}/toggle-status")
    public ResponseEntity<String> toggleVariantStatus(@PathVariable Integer variantId) {
        productVariantService.toggleVariantStatus(variantId);
        return ResponseEntity.ok("Variant status toggled");
    }

    @GetMapping("/units")
    public ResponseEntity<List<Unit>> getAllUnits() {
        return ResponseEntity.ok(productVariantService.getAllUnits());
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Integer id, @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<String> toggleStatus(@PathVariable Integer id) {
        productService.toggleStatus(id);
        return ResponseEntity.ok("Product status toggled");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.ok("Product deleted");
    }
}
