package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.entity.Category;
import com.smalltrend.service.products.CategoriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
})
public class CategoryController {

    private final CategoriesService service;

    @PostMapping
    public ResponseEntity<CategoriesResponse> create(
            @RequestBody CategoriesRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<CategoriesResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriesResponse> update(
            @PathVariable Integer id,
            @RequestBody CategoriesRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}