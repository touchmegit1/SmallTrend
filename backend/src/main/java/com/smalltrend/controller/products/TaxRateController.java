package com.smalltrend.controller.products;

import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.TaxRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cung cấp API lấy danh sách các loại Thuế suất (TaxRate)
 */
@RestController
@RequestMapping("/api/tax-rates")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000" })
public class TaxRateController {

    private final TaxRateRepository taxRateRepository;

    // Trả về danh sách tất cả các loại tỷ lệ thuế được thiết lập trong hệ thống
    @GetMapping
    public ResponseEntity<List<TaxRate>> getAll() {
        return ResponseEntity.ok(taxRateRepository.findAll());
    }

    // Thêm mới thuế
    @PostMapping
    public ResponseEntity<TaxRate> create(@RequestBody TaxRate taxRate) {
        return ResponseEntity.ok(taxRateRepository.save(taxRate));
    }

    // Cập nhật thuế
    @PutMapping("/{id}")
    public ResponseEntity<TaxRate> update(@PathVariable Integer id, @RequestBody TaxRate taxRateData) {
        return taxRateRepository.findById(id).map(existing -> {
            existing.setName(taxRateData.getName());
            existing.setRate(taxRateData.getRate());
            existing.setActive(taxRateData.isActive());
            return ResponseEntity.ok(taxRateRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Xóa thuế
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (taxRateRepository.existsById(id)) {
            taxRateRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
