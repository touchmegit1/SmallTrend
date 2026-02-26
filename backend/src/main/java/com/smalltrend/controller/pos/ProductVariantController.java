package com.smalltrend.controller.pos;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.smalltrend.dto.pos.ProductVariantRespone;
import com.smalltrend.service.ProductVariantService;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ProductVariantController {
    
    private final ProductVariantService productService;
    
    @GetMapping("/product")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<List<ProductVariantRespone>> getAllProductVariants(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String barcode) {
        List<ProductVariantRespone> products = productService.getAllProductVariants(search, barcode);
        return ResponseEntity.ok(products);
    }
}
