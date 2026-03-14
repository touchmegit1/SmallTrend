package com.smalltrend.controller.products;

import com.smalltrend.entity.Brand;
import com.smalltrend.service.products.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các HTTP request liên quan đến Brand (Thương hiệu)
 */
@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class BrandController {

    private final BrandService brandService;

    // Tạo mới một thương hiệu
    @PostMapping
    public ResponseEntity<Brand> create(@RequestBody Brand brand) {
        return ResponseEntity.ok(brandService.create(brand));
    }

    // Trả về danh sách tất cả thương hiệu
    @GetMapping
    public ResponseEntity<List<Brand>> getAll() {
        return ResponseEntity.ok(brandService.getAll());
    }

    // Lấy chi tiết thông tin thương hiệu theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Brand> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(brandService.getById(id));
    }

    // Cập nhật thông tin thương hiệu đã có
    @PutMapping("/{id}")
    public ResponseEntity<Brand> update(
            @PathVariable Integer id,
            @RequestBody Brand brand) {
        return ResponseEntity.ok(brandService.update(id, brand));
    }

    // Xoá thương hiệu (được kiểm tra xem có sản phẩm nào thuộc thương hiệu đó để
    // chặn lại bên dưới Service)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        brandService.delete(id);
        return ResponseEntity.ok("Brand deactivated");
    }
}