package com.smalltrend.service;

import com.smalltrend.dto.gemini.GeminiRequest;
import com.smalltrend.dto.gemini.GeminiResponse;
import com.smalltrend.entity.AiSettings;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final RestTemplate restTemplate;

    @Value("${GEMINI_API_KEY:}")
    private String apiKey;

    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

    /**
     * Generate content using Gemini API with configurable settings.
     */
    public String generateContent(String prompt, AiSettings settings) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is not configured. AI response is disabled.");
            return "AI chưa được cấu hình GEMINI_API_KEY. Vui lòng cập nhật biến môi trường để sử dụng tính năng AI.";
        }

        String model = settings != null && settings.getGeminiModel() != null
                ? settings.getGeminiModel()
                : "gemini-2.0-flash";
        String url = GEMINI_API_BASE + model + ":generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        GeminiRequest request = new GeminiRequest(
                Collections.singletonList(new GeminiRequest.Content(
                        Collections.singletonList(new GeminiRequest.Part(prompt))
                ))
        );

        // Apply generation config from settings
        if (settings != null) {
            Double temperature = settings.getTemperature() != null ? settings.getTemperature() : 1.0;
            Integer maxTokens = settings.getMaxOutputTokens() != null ? settings.getMaxOutputTokens() : 1024;
            request.setGenerationConfig(new GeminiRequest.GenerationConfig(temperature, maxTokens));
        }

        HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(url, entity, GeminiResponse.class);

            if (response.getBody() != null && response.getBody().getCandidates() != null && !response.getBody().getCandidates().isEmpty()) {
                GeminiResponse.Candidate candidate = response.getBody().getCandidates().get(0);
                if (candidate.getContent() != null && candidate.getContent().getParts() != null && !candidate.getContent().getParts().isEmpty()) {
                    return candidate.getContent().getParts().get(0).getText();
                }
            }
            return "No response from Gemini.";
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.error("Gemini API Quota Exceeded: {}", e.getMessage());
            return "I am currently overwhelmed with requests. Please try again later.";
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            return "An error occurred while communicating with the AI.";
        }
    }

    /**
     * Backward-compatible overload for code that doesn't have settings.
     */
    public String generateContent(String prompt) {
        return generateContent(prompt, null);
    }
}
