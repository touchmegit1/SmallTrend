package com.smalltrend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verifyNoInteractions;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smalltrend.entity.AiSettings;
import com.smalltrend.repository.CouponRepository;
import com.smalltrend.repository.CustomerRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.OrderItemRepository;
import com.smalltrend.repository.OrderRepository;

@ExtendWith(MockitoExtension.class)
public class AiChatServiceTest {

    @Mock
    private GeminiService geminiService;

    @Mock
    private AiSettingsService aiSettingsService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private InventoryStockRepository inventoryStockRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private AiChatService aiChatService;

    @Test
    public void testChat() {
        AiSettings settings = AiSettings.builder()
                .aiEnabled(true)
                .systemPrompt("Test prompt")
                .responseLanguage("vi")
                .includeSalesData(false)
                .includeInventoryData(false)
                .includeCustomerData(false)
                .includeCouponData(false)
                .build();

        when(aiSettingsService.getSettingsEntity()).thenReturn(settings);
        when(geminiService.generateContent(anyString(), any(AiSettings.class)))
                .thenReturn("This is a mock response from Gemini.");

        // Execute
        String response = aiChatService.chat("How is business?");

        // Verify
        assertEquals("This is a mock response from Gemini.", response);
    }

    @Test
    public void testChatWhenAiDisabled() {
        AiSettings settings = AiSettings.builder()
                .aiEnabled(false)
                .build();

        when(aiSettingsService.getSettingsEntity()).thenReturn(settings);

        String response = aiChatService.chat("How is business?");

        assertEquals("AI hiện đang tắt. Vui lòng liên hệ quản trị viên để bật tính năng này.", response);
        verifyNoInteractions(geminiService);
    }
}
