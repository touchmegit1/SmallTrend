package com.smalltrend.controller.pos;

import com.smalltrend.dto.pos.BarcodeLookupResponse;
import com.smalltrend.service.BarcodeLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pos/barcode")
@RequiredArgsConstructor
public class BarcodeLookupController {

    private final BarcodeLookupService barcodeLookupService;

    @GetMapping("/{barcode}")
    @PreAuthorize("hasAuthority('POS_ACCESS')")
    public ResponseEntity<BarcodeLookupResponse> lookupBarcode(@PathVariable String barcode) {
        BarcodeLookupResponse response = barcodeLookupService.lookupBarcode(barcode);
        return ResponseEntity.ok(response);
    }
}
