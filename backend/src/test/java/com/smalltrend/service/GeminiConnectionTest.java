package com.smalltrend.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class GeminiConnectionTest {

    @Autowired
    private GeminiService geminiService;

    @Test
    public void testGeminiConnection() {
        System.out.println("Starting Gemini API Connection Test...");
        String prompt = "Hello, response with 'Connected' if you receive this.";
        String response = geminiService.generateContent(prompt);

        System.out.println("Response from Gemini: " + response);

        assertNotNull(response, "Response should not be null");
        assertFalse(response.contains("Xin lỗi"), "Response indicates an error: " + response);
        assertFalse(response.contains("Lỗi"), "Response indicates an error: " + response);
        System.out.println("Gemini API Connection Test Passed!");
    }
}
