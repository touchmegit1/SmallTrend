package com.smalltrend.controller;

import com.smalltrend.entity.Brand;
import com.smalltrend.entity.Category;
import com.smalltrend.entity.Role;
import com.smalltrend.repository.BrandRepository;
import com.smalltrend.repository.CategoryRepository;
import com.smalltrend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Test Controller Controller để test API hoạt động
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "message", "SmallTrend Backend is running!",
                "timestamp", java.time.Instant.now().toString(),
                "database", "MySQL Connected"
        );
    }

    @GetMapping("/database-test")
    public Map<String, Object> databaseTest() {
        try {
            // Test creating simple data
            Role adminRole = Role.builder()
                    .name("ADMIN")
                    .description("Administrator role")
                    .build();
            roleRepository.save(adminRole);

            Brand testBrand = Brand.builder()
                    .name("Test Brand")
                    .build();
            brandRepository.save(testBrand);

            Category testCategory = Category.builder()
                    .name("Test Category")
                    .build();
            categoryRepository.save(testCategory);

            return Map.of(
                    "status", "SUCCESS",
                    "message", "Database operations successful",
                    "roles_count", roleRepository.count(),
                    "brands_count", brandRepository.count(),
                    "categories_count", categoryRepository.count()
            );
        } catch (Exception e) {
            return Map.of(
                    "status", "ERROR",
                    "message", e.getMessage(),
                    "error", e.getClass().getSimpleName()
            );
        }
    }

    @GetMapping("/roles")
    public List<Role> getRoles() {
        return roleRepository.findAll();
    }

    @GetMapping("/brands")
    public List<Brand> getBrands() {
        return brandRepository.findAll();
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }
}
