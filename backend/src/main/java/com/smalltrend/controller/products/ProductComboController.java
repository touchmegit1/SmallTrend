package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CreateProductComboRequest;
import com.smalltrend.dto.products.ProductComboResponse;
import com.smalltrend.service.products.ProductComboService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các HTTP request liên quan đến Product Combo (Combo Sản
 * phẩm) Cho phép tạo, sửa, xóa và truy vấn các gói combo sản phẩm
 */
@RestController
@RequestMapping("/api/product-combos")
@RequiredArgsConstructor
public class ProductComboController {

    private final ProductComboService productComboService;

    // Lấy danh sách tất cả các combo hiện có
    @GetMapping
    // Lấy all.
    public ResponseEntity<List<ProductComboResponse>> getAll() {
        return ResponseEntity.ok(productComboService.getAllCombos());
    }

    // Lấy thông tin chi tiết một combo theo ID
    @GetMapping("/{id}")
    // Lấy by id.
    public ResponseEntity<ProductComboResponse> getById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(productComboService.getComboById(id));
    }

    // Tạo mới một combo sản phẩm
    @PostMapping
    // Tạo .
    public ResponseEntity<ProductComboResponse> create(@RequestBody CreateProductComboRequest request) {
        return ResponseEntity.ok(productComboService.createCombo(request));
    }

    // Cập nhật thông tin của một combo hiện có
    @PutMapping("/{id}")
    // Cập nhật .
    public ResponseEntity<ProductComboResponse> update(@PathVariable("id") Integer id,
            @RequestBody CreateProductComboRequest request) {
        return ResponseEntity.ok(productComboService.updateCombo(id, request));
    }

    // Bật/Tắt trạng thái hoạt động (mở bán/ngừng bán) của combo
    @PutMapping("/{id}/toggle-status")
    // Đổi trạng thái status.
    public ResponseEntity<String> toggleStatus(@PathVariable("id") Integer id) {
        productComboService.toggleStatus(id);
        return ResponseEntity.ok("Đã thay đổi trạng thái combo");
    }

    // Xóa một combo theo ID
    @DeleteMapping("/{id}")
    // Xóa .
    public ResponseEntity<String> delete(@PathVariable("id") Integer id) {
        productComboService.deleteCombo(id);
        return ResponseEntity.ok("Đã xóa combo thành công");
    }
}
