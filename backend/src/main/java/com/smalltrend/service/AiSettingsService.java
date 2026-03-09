package com.smalltrend.service;

import com.smalltrend.dto.ai.AiPublicSettingsResponse;
import com.smalltrend.dto.ai.AiSettingsRequest;
import com.smalltrend.dto.ai.AiSettingsResponse;
import com.smalltrend.entity.AiSettings;
import com.smalltrend.repository.AiSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiSettingsService {

    private static final int SINGLETON_ID = 1;
    private final AiSettingsRepository aiSettingsRepository;

    /**
     * Get current AI settings. Creates default if none exists.
     */
    public AiSettings getSettingsEntity() {
        return aiSettingsRepository.findById(SINGLETON_ID)
                .orElseGet(() -> {
                    log.info("No AI settings found, creating defaults");
                    AiSettings defaults = AiSettings.builder().id(SINGLETON_ID).build();
                    return aiSettingsRepository.save(defaults);
                });
    }

    /**
     * Get settings as response DTO (for admin page).
     */
    public AiSettingsResponse getSettings() {
        AiSettings settings = getSettingsEntity();
        return mapToResponse(settings);
    }

    /**
     * Update settings (admin only).
     */
    public AiSettingsResponse updateSettings(AiSettingsRequest request) {
        AiSettings settings = getSettingsEntity();

        if (request.getGeminiModel() != null) settings.setGeminiModel(request.getGeminiModel());
        if (request.getTemperature() != null) settings.setTemperature(request.getTemperature());
        if (request.getMaxOutputTokens() != null) settings.setMaxOutputTokens(request.getMaxOutputTokens());
        if (request.getAiEnabled() != null) settings.setAiEnabled(request.getAiEnabled());

        if (request.getSystemPrompt() != null) settings.setSystemPrompt(request.getSystemPrompt());
        if (request.getAiName() != null) settings.setAiName(request.getAiName());
        if (request.getResponseLanguage() != null) settings.setResponseLanguage(request.getResponseLanguage());
        if (request.getWelcomeMessage() != null) settings.setWelcomeMessage(request.getWelcomeMessage());

        if (request.getIncludeSalesData() != null) settings.setIncludeSalesData(request.getIncludeSalesData());
        if (request.getIncludeInventoryData() != null) settings.setIncludeInventoryData(request.getIncludeInventoryData());
        if (request.getIncludeCustomerData() != null) settings.setIncludeCustomerData(request.getIncludeCustomerData());
        if (request.getIncludeCouponData() != null) settings.setIncludeCouponData(request.getIncludeCouponData());
        if (request.getLowStockThreshold() != null) settings.setLowStockThreshold(request.getLowStockThreshold());

        // Quick prompts — allow setting to empty string to clear
        if (request.getQuickPrompt1() != null) settings.setQuickPrompt1(request.getQuickPrompt1());
        if (request.getQuickPrompt2() != null) settings.setQuickPrompt2(request.getQuickPrompt2());
        if (request.getQuickPrompt3() != null) settings.setQuickPrompt3(request.getQuickPrompt3());
        if (request.getQuickPrompt4() != null) settings.setQuickPrompt4(request.getQuickPrompt4());
        if (request.getQuickPrompt5() != null) settings.setQuickPrompt5(request.getQuickPrompt5());

        AiSettings saved = aiSettingsRepository.save(settings);
        log.info("AI settings updated successfully");
        return mapToResponse(saved);
    }

    /**
     * Get public settings (for chat page — non-sensitive only).
     */
    public AiPublicSettingsResponse getPublicSettings() {
        AiSettings settings = getSettingsEntity();

        List<String> prompts = new ArrayList<>();
        if (settings.getQuickPrompt1() != null && !settings.getQuickPrompt1().isBlank()) prompts.add(settings.getQuickPrompt1());
        if (settings.getQuickPrompt2() != null && !settings.getQuickPrompt2().isBlank()) prompts.add(settings.getQuickPrompt2());
        if (settings.getQuickPrompt3() != null && !settings.getQuickPrompt3().isBlank()) prompts.add(settings.getQuickPrompt3());
        if (settings.getQuickPrompt4() != null && !settings.getQuickPrompt4().isBlank()) prompts.add(settings.getQuickPrompt4());
        if (settings.getQuickPrompt5() != null && !settings.getQuickPrompt5().isBlank()) prompts.add(settings.getQuickPrompt5());

        return AiPublicSettingsResponse.builder()
                .aiName(settings.getAiName())
                .welcomeMessage(settings.getWelcomeMessage())
                .aiEnabled(settings.getAiEnabled())
                .quickPrompts(prompts)
                .build();
    }

    private AiSettingsResponse mapToResponse(AiSettings settings) {
        return AiSettingsResponse.builder()
                .geminiModel(settings.getGeminiModel())
                .temperature(settings.getTemperature())
                .maxOutputTokens(settings.getMaxOutputTokens())
                .aiEnabled(settings.getAiEnabled())
                .systemPrompt(settings.getSystemPrompt())
                .aiName(settings.getAiName())
                .responseLanguage(settings.getResponseLanguage())
                .welcomeMessage(settings.getWelcomeMessage())
                .includeSalesData(settings.getIncludeSalesData())
                .includeInventoryData(settings.getIncludeInventoryData())
                .includeCustomerData(settings.getIncludeCustomerData())
                .includeCouponData(settings.getIncludeCouponData())
                .lowStockThreshold(settings.getLowStockThreshold())
                .quickPrompt1(settings.getQuickPrompt1())
                .quickPrompt2(settings.getQuickPrompt2())
                .quickPrompt3(settings.getQuickPrompt3())
                .quickPrompt4(settings.getQuickPrompt4())
                .quickPrompt5(settings.getQuickPrompt5())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}
