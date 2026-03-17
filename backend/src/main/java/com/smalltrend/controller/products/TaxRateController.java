package com.smalltrend.controller.products;

import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.TaxRateRepository;
import com.smalltrend.validation.product.TaxRateValidator;
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
public class TaxRateController {

    private final TaxRateRepository taxRateRepository;
    private final TaxRateValidator taxRateValidator;

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
        TaxRate existing = taxRateValidator.requireExistingTaxRate(id);
        existing.setName(taxRateData.getName());
        existing.setRate(taxRateData.getRate());
        existing.setActive(taxRateData.isActive());
        return ResponseEntity.ok(taxRateRepository.save(existing));
    }

    // Xóa thuế
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        taxRateValidator.requireExistingTaxRate(id);
        taxRateRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
