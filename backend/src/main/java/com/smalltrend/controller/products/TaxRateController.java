package com.smalltrend.controller.products;

import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.TaxRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tax-rates")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class TaxRateController {

    private final TaxRateRepository taxRateRepository;

    @GetMapping
    public ResponseEntity<List<TaxRate>> getAll() {
        return ResponseEntity.ok(taxRateRepository.findAll());
    }
}
