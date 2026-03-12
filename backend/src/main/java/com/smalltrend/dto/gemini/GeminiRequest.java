package com.smalltrend.dto.gemini;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GeminiRequest {
    private List<Content> contents;
    private GenerationConfig generationConfig;

    // Constructor without generationConfig (backwards compatible)
    public GeminiRequest(List<Content> contents) {
        this.contents = contents;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Part {
        private String text;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GenerationConfig {
        private Double temperature;
        private Integer maxOutputTokens;
    }
}
