package com.smalltrend.controller;

import com.smalltrend.dto.ai.AiPublicSettingsResponse;
import com.smalltrend.dto.ai.AiSettingsRequest;
import com.smalltrend.dto.ai.AiSettingsResponse;
import com.smalltrend.service.AiSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/settings")
@RequiredArgsConstructor
public class AiSettingsController {

    private final AiSettingsService aiSettingsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AiSettingsResponse> getSettings() {
        return ResponseEntity.ok(aiSettingsService.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AiSettingsResponse> updateSettings(@RequestBody AiSettingsRequest request) {
        return ResponseEntity.ok(aiSettingsService.updateSettings(request));
    }

    @GetMapping("/public")
    public ResponseEntity<AiPublicSettingsResponse> getPublicSettings() {
        return ResponseEntity.ok(aiSettingsService.getPublicSettings());
    }
}
