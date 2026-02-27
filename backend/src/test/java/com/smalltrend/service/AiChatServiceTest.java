package com.smalltrend.service;

import com.smalltrend.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AiChatServiceTest {

    @Mock
    private GeminiService geminiService;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private AiChatService aiChatService;

    @Test
    public void testChat() {
        // Mock Repository
        when(orderRepository.sumTotalRevenue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("1000.00"));
        when(orderRepository.countOrders(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(10L);

        // Mock Gemini Service
        when(geminiService.generateContent(anyString())).thenReturn("This is a mock response from Gemini.");

        // Execute
        String response = aiChatService.chat("How is business?");

        // Verify
        assertEquals("This is a mock response from Gemini.", response);
    }
}
