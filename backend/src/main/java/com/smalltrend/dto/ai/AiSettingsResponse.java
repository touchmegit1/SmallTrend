package com.smalltrend.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSettingsResponse {

    // Model Configuration
    private String geminiModel;
    private Double temperature;
    private Integer maxOutputTokens;
    private Boolean aiEnabled;

    // System Prompt & Behavior
    private String systemPrompt;
    private String aiName;
    private String responseLanguage;
    private String welcomeMessage;

    // Context Control
    private Boolean includeSalesData;
    private Boolean includeInventoryData;
    private Boolean includeCustomerData;
    private Boolean includeCouponData;
    private Integer lowStockThreshold;

    // Quick Prompts
    private String quickPrompt1;
    private String quickPrompt2;
    private String quickPrompt3;
    private String quickPrompt4;
    private String quickPrompt5;

    // Metadata
    private LocalDateTime updatedAt;
}
