package com.smalltrend.service;

import com.smalltrend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AiChatServiceTest {

    @Mock
    private GeminiService geminiService;

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
        // Mock OrderRepository
        when(orderRepository.sumTotalRevenue(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("1000.00"));
        when(orderRepository.countOrders(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(10L);
        when(orderRepository.revenueByPaymentMethod(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(new ArrayList<>());
        when(orderRepository.countByStatus(anyString()))
                .thenReturn(0L);

        // Mock OrderItemRepository
        when(orderItemRepository.findTopSellingProducts(any(LocalDateTime.class), any(LocalDateTime.class), anyInt()))
                .thenReturn(new ArrayList<>());
        when(orderItemRepository.findBottomSellingProducts(any(LocalDateTime.class), any(LocalDateTime.class), anyInt()))
                .thenReturn(new ArrayList<>());

        // Mock InventoryStockRepository
        when(inventoryStockRepository.findLowStockSummary(anyInt()))
                .thenReturn(new ArrayList<>());

        // Mock CustomerRepository
        when(customerRepository.countTotalCustomers())
                .thenReturn(0L);
        when(customerRepository.findTopCustomers(anyInt()))
                .thenReturn(new ArrayList<>());

        // Mock Gemini Service
        when(geminiService.generateContent(anyString())).thenReturn("This is a mock response from Gemini.");

        // Execute
        String response = aiChatService.chat("How is business?");

        // Verify
        assertEquals("This is a mock response from Gemini.", response);
    }
}
