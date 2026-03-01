package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CreateProductComboRequest;
import com.smalltrend.dto.products.ProductComboResponse;
import com.smalltrend.service.products.ProductComboService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-combos")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ProductComboController {

    private final ProductComboService productComboService;

    @GetMapping
    public ResponseEntity<List<ProductComboResponse>> getAll() {
        return ResponseEntity.ok(productComboService.getAllCombos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductComboResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productComboService.getComboById(id));
    }

    @PostMapping
    public ResponseEntity<ProductComboResponse> create(@RequestBody CreateProductComboRequest request) {
        return ResponseEntity.ok(productComboService.createCombo(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductComboResponse> update(@PathVariable Integer id,
            @RequestBody CreateProductComboRequest request) {
        return ResponseEntity.ok(productComboService.updateCombo(id, request));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<String> toggleStatus(@PathVariable Integer id) {
        productComboService.toggleStatus(id);
        return ResponseEntity.ok("Combo status toggled");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        productComboService.deleteCombo(id);
        return ResponseEntity.ok("Combo deleted successfully");
    }
}
