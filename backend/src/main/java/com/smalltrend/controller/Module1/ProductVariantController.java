package com.smalltrend.controller.Module1;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.smalltrend.dto.Module1.ProductVariantRespone;
import com.smalltrend.service.Module1.ProductVariantService;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ProductVariantController {
    
    private final ProductVariantService productService;
    
    @GetMapping("/product")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ProductVariantRespone>> getAllProductVariants() {
        List<ProductVariantRespone> products = productService.getAllProductVariants();
        return ResponseEntity.ok(products);
    }
}
