package com.smalltrend.controller.Products;


import com.smalltrend.entity.CategoriesResponse;
import com.smalltrend.service.Products.CategoriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class CategoryController {
    private final CategoriesService categoriesService;

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<CategoriesResponse>> getAllCategories() {
        List<CategoriesResponse> categories = categoriesService.getAll();
        return ResponseEntity.ok(categories);
    }
}
