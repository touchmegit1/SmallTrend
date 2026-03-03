package com.smalltrend.controller;

import com.smalltrend.dto.ai.AiChatRequest;
import com.smalltrend.dto.ai.AiChatResponse;
import com.smalltrend.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        String answer = aiChatService.chat(request.getQuery());
        return ResponseEntity.ok(new AiChatResponse(
                answer,
                request.getSessionId(),
                java.time.Instant.now().toString()
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(aiChatService.getStatistics());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(aiChatService.getHealthStatus());
    }
}
