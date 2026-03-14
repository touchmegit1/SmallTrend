package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.service.products.CategoriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các HTTP request liên quan đến Danh mục (Category)
 */
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

    /**
     * API tạo danh mục mới
     * POST /api/categories
     */
    @PostMapping
    public ResponseEntity<CategoriesResponse> create(@RequestBody CategoriesRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    /**
     * API lấy danh sách tất cả danh mục
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<List<CategoriesResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * API cập nhật thông tin danh mục theo ID
     * PUT /api/categories/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoriesResponse> update(
            @PathVariable Integer id,
            @RequestBody CategoriesRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    /**
     * API xoá danh mục theo ID
     * DELETE /api/categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}