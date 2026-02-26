package com.smalltrend.controller.products;

import com.smalltrend.entity.Brand;
import com.smalltrend.service.products.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class BrandController {


    private final BrandService brandService;

    @PostMapping
    public ResponseEntity<Brand> create(@RequestBody Brand brand) {
        return ResponseEntity.ok(brandService.create(brand));
    }

    @GetMapping
    public ResponseEntity<List<Brand>> getAll() {
        return ResponseEntity.ok(brandService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(brandService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Brand> update(
            @PathVariable Integer id,
            @RequestBody Brand brand) {
        return ResponseEntity.ok(brandService.update(id, brand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        brandService.delete(id);
        return ResponseEntity.ok("Brand deactivated");
    }
}