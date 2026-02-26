package com.smalltrend.controller.products;

import com.smalltrend.entity.Category;
import com.smalltrend.service.products.CategoriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
})
public class CategoryController {

    private final CategoriesService categoriesService;

    @PostMapping
    public ResponseEntity<Category> create(@RequestBody Category category) {
        return ResponseEntity.ok(categoriesService.create(category));
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoriesService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(categoriesService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(
            @PathVariable Integer id,
            @RequestBody Category category) {
        return ResponseEntity.ok(categoriesService.update(id, category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        categoriesService.delete(id);
        return ResponseEntity.ok("Category deactivated");
    }
}