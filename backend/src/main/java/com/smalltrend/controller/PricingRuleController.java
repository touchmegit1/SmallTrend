package com.smalltrend.controller;

import com.smalltrend.entity.BulkPricingRule;
import com.smalltrend.entity.ComboDeal;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.repository.BulkPricingRuleRepository;
import com.smalltrend.repository.ComboDealRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pricing")
public class PricingRuleController {

    private final BulkPricingRuleRepository bulkRepo;
    private final ComboDealRepository comboRepo;

    public PricingRuleController(BulkPricingRuleRepository bulkRepo, ComboDealRepository comboRepo) {
        this.bulkRepo = bulkRepo;
        this.comboRepo = comboRepo;
    }

    // ---- Bulk Pricing Rules ----
    @GetMapping("/bulk")
    public List<BulkPricingRule> listBulk() {
        return bulkRepo.findAll();
    }

    @PostMapping("/bulk")
    @Transactional
    public BulkPricingRule createBulk(@RequestBody BulkPricingRule rule) {
        return bulkRepo.save(rule);
    }

    @PutMapping("/bulk/{id}")
    @Transactional
    public ResponseEntity<BulkPricingRule> updateBulk(@PathVariable Long id, @RequestBody BulkPricingRule rule) {
        return bulkRepo.findById(id)
                .map(existing -> {
                    rule.setId(existing.getId());
                    return ResponseEntity.ok(bulkRepo.save(rule));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/bulk/{id}")
    @Transactional
    public ResponseEntity<Void> deleteBulk(@PathVariable Long id) {
        if (bulkRepo.existsById(id)) {
            bulkRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/bulk/active")
    public List<BulkPricingRule> activeBulk() {
        LocalDateTime now = LocalDateTime.now();
        return bulkRepo.findByActiveTrueAndStartAtLessThanEqualAndEndAtGreaterThanEqual(now, now);
    }

    // Simple evaluation: list rules by product variant id (if provided)
    @GetMapping("/bulk/evaluate")
    public List<BulkPricingRule> evaluate(@RequestParam(required = false) Integer productVariantId) {
        if (productVariantId == null) {
            return activeBulk();
        }
        ProductVariant pv = new ProductVariant();
        pv.setId(productVariantId);
        return bulkRepo.findByProductVariantAndActiveTrue(pv);
    }

    // ---- Combo Deals ----
    @GetMapping("/combo")
    public List<ComboDeal> listCombos() {
        return comboRepo.findAll();
    }

    @PostMapping("/combo")
    @Transactional
    public ComboDeal createCombo(@RequestBody ComboDeal combo) {
        return comboRepo.save(combo);
    }

    @PutMapping("/combo/{id}")
    @Transactional
    public ResponseEntity<ComboDeal> updateCombo(@PathVariable Long id, @RequestBody ComboDeal combo) {
        return comboRepo.findById(id)
                .map(existing -> {
                    combo.setId(existing.getId());
                    return ResponseEntity.ok(comboRepo.save(combo));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/combo/{id}")
    @Transactional
    public ResponseEntity<Void> deleteCombo(@PathVariable Long id) {
        if (comboRepo.existsById(id)) {
            comboRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
