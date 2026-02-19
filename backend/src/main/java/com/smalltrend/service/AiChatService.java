package com.smalltrend.service;

import com.smalltrend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private final GeminiService geminiService;
    private final OrderRepository orderRepository;


    public String chat(String userMessage) {
        // Simple RAG: Fetch basic stats to augment the prompt
        // In a real scenario, we would use vector search or more complex logic to decide what data to fetch.
        // For now, we always prioritize recent sales data if relevant keywords are present, or just provide a general summary context.

        String context = buildContext();
        String fullPrompt = "Bạn là trợ lý AI hữu ích cho hệ thống POS tên là SmallTrend. " +
                "Bạn PHẢI trả lời bằng tiếng Việt một cách tự nhiên và chuyên nghiệp. " +
                "Tuyệt đối KHÔNG sử dụng các ký tự Markdown (như **in đậm** hoặc *in nghiêng*) vì giao diện người dùng không hỗ trợ. " +
                "Hãy dùng dấu '-' để tạo danh sách và ngắt dòng hợp lý để văn bản dễ dọc nhất.\n" +
                "Dưới đây là bối cảnh kinh doanh hiện tại:\n" + context + "\n\n" +
                "Người dùng: " + userMessage + "\n" +
                "AI:";

        return geminiService.generateContent(fullPrompt);
    }

    private String buildContext() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();

        BigDecimal todayRevenue = orderRepository.sumTotalRevenue(startOfDay, now);
        Long todayOrders = orderRepository.countOrders(startOfDay, now);

        BigDecimal monthRevenue = orderRepository.sumTotalRevenue(startOfMonth, now);
        Long monthOrders = orderRepository.countOrders(startOfMonth, now);

        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;
        if (monthRevenue == null) monthRevenue = BigDecimal.ZERO;

        StringBuilder sb = new StringBuilder();
        sb.append("Today's Date: ").append(now.format(DateTimeFormatter.ISO_LOCAL_DATE)).append("\n");
        sb.append("Today's Revenue: ").append(todayRevenue).append("\n");
        sb.append("Today's Order Count: ").append(todayOrders).append("\n");
        sb.append("Month's Revenue: ").append(monthRevenue).append("\n");
        sb.append("Month's Order Count: ").append(monthOrders).append("\n");

        return sb.toString();
    }
}
