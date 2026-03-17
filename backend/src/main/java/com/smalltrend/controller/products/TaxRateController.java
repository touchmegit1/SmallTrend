package com.smalltrend.controller.products;

import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.TaxRateRepository;
import com.smalltrend.validation.product.TaxRateValidator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cung cấp API lấy danh sách các loại Thuế suất (TaxRate)
 */
@RestController
@RequestMapping("/api/tax-rates")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class TaxRateController {

    private final TaxRateRepository taxRateRepository;
    private final TaxRateValidator taxRateValidator;

    public TaxRateController(TaxRateRepository taxRateRepository, TaxRateValidator taxRateValidator) {
        this.taxRateRepository = taxRateRepository;
        this.taxRateValidator = taxRateValidator;
    }

    // Trả về danh sách tất cả các loại tỷ lệ thuế được thiết lập trong hệ thống
    @GetMapping
    public ResponseEntity<List<TaxRate>> getAll() {
        return ResponseEntity.ok(taxRateRepository.findAll());
    }

    // Thêm mới thuế
    @PostMapping
    public ResponseEntity<TaxRate> create(@RequestBody TaxRate taxRate) {
        String normalizedName = taxRateValidator.validateAndNormalizeName(taxRate.getName());
        taxRateValidator.validateRate(taxRate.getRate());
        taxRateValidator.validateNameUniqueForCreate(normalizedName);

        taxRate.setName(normalizedName);
        return ResponseEntity.ok(taxRateRepository.save(taxRate));
    }

    // Cập nhật thuế
    @PutMapping("/{id}")
    public ResponseEntity<TaxRate> update(@PathVariable Integer id, @RequestBody TaxRate taxRateData) {
        TaxRate existing = taxRateValidator.requireExistingTaxRate(id);

        String normalizedName = taxRateValidator.validateAndNormalizeName(taxRateData.getName());
        taxRateValidator.validateRate(taxRateData.getRate());
        taxRateValidator.validateNameUniqueForUpdate(normalizedName, id);

        existing.setName(normalizedName);
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
