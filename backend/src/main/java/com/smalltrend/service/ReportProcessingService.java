package com.smalltrend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smalltrend.dto.report.ReportGenerateRequest;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Order;
import com.smalltrend.entity.OrderItem;
import com.smalltrend.entity.Report;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.OrderRepository;
import com.smalltrend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Separate service for async report processing. Spring's @Async only works when
 * called from a different bean (proxy-based AOP).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportProcessingService {

    private final ReportRepository reportRepository;
    private final OrderRepository orderRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final FileStorageService fileStorageService;
    private final ReportGeneratorService reportGeneratorService;
    private final ObjectMapper objectMapper;

    /**
     * Async report processing - must be in a separate bean from the caller for
     * Spring's @Async proxy to work.
     */
    @Async
    @Transactional
    public void processReportAsync(Integer reportId, ReportGenerateRequest request) {
        try {
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Report not found"));

            // Update status to PROCESSING
            report.setStatus("PROCESSING");
            reportRepository.save(report);

            log.info("Processing report: {} - Type: {}", reportId, request.getType());

            // 1. Fetch Data & Calculate
            Map<String, Object> reportDataMap = new HashMap<>();
            byte[] fileContent = null;
            String fileUrl = null;

            LocalDateTime from = request.getFromDate() != null ? request.getFromDate().atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
            LocalDateTime to = request.getToDate() != null ? request.getToDate().atTime(23, 59, 59) : LocalDateTime.now();

            String reportType = request.getType().toUpperCase();
            switch (reportType) {
                case "DAILY_REVENUE":
                case "REVENUE":
                    fileContent = processRevenueReport(from, to, request.getFormat(), reportDataMap);
                    break;
                case "TOP_PRODUCTS":
                case "PRODUCTS":
                    fileContent = processTopProductsReport(from, to, request.getFormat(), reportDataMap);
                    break;
                case "LOW_STOCK":
                case "INVENTORY":
                    fileContent = processInventoryReport(request.getFormat(), reportDataMap);
                    break;
                case "CUSTOMER_ANALYSIS":
                case "CUSTOMERS":
                    fileContent = processCustomerReport(from, to, request.getFormat(), reportDataMap);
                    break;
                default:
                    throw new IllegalArgumentException("Unknown report type: " + request.getType());
            }

            // 2. Save File
            if (fileContent != null && fileContent.length > 0) {
                String extension = "pdf";
                if (request.getFormat().equalsIgnoreCase("EXCEL")) {
                    extension = "xlsx";
                } else if (request.getFormat().equalsIgnoreCase("CSV")) {
                    extension = "csv";
                }
                String fileName = "Report_" + request.getType() + "_" + System.currentTimeMillis() + "." + extension;
                fileUrl = fileStorageService.storeFile(fileContent, fileName);
            }

            // 3. Serialize Data for Frontend Preview
            String jsonData = objectMapper.writeValueAsString(reportDataMap);

            // Update report with completed status
            report.setStatus("COMPLETED");
            report.setData(jsonData);
            report.setCompletedAt(LocalDateTime.now());
            report.setFilePath(fileUrl);

            reportRepository.save(report);

            log.info("Report completed: {}", reportId);

        } catch (Exception e) {
            log.error("Error processing report: {}", reportId, e);

            // Update status to FAILED
            reportRepository.findById(reportId).ifPresent(r -> {
                r.setStatus("FAILED");
                reportRepository.save(r);
            });
        }
    }

    private byte[] processRevenueReport(LocalDateTime from, LocalDateTime to, String format, Map<String, Object> dataMap) {
        List<Order> orders = orderRepository.findByOrderDateBetween(from, to);

        // Calculate daily stats
        Map<LocalDate, DailyStats> dailyStats = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getOrderDate().toLocalDate(),
                        Collectors.reducing(
                                new DailyStats(BigDecimal.ZERO, 0),
                                order -> new DailyStats(order.getTotalAmount(), 1),
                                (a, b) -> new DailyStats(a.revenue.add(b.revenue), a.orderCount + b.orderCount)
                        )
                ));

        List<Map<String, Object>> chartData = dailyStats.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", entry.getKey().toString());
                    map.put("revenue", entry.getValue().revenue);
                    map.put("orders", entry.getValue().orderCount);
                    return map;
                })
                .collect(Collectors.toList());

        BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dataMap.put("totalRevenue", totalRevenue);
        dataMap.put("totalOrders", orders.size());
        dataMap.put("chartData", chartData);
        dataMap.put("summary", "Revenue Report from " + from.toLocalDate() + " to " + to.toLocalDate());

        // File Generation Data
        List<String> headers = Arrays.asList("Date", "Orders", "Revenue");
        List<List<String>> rows = chartData.stream()
                .map(m -> Arrays.asList(
                m.get("date").toString(),
                m.get("orders").toString(),
                m.get("revenue").toString()
        ))
                .collect(Collectors.toList());

        if ("PDF".equalsIgnoreCase(format)) {
            return reportGeneratorService.generatePdf("Revenue Report", headers, rows);
        } else if ("CSV".equalsIgnoreCase(format)) {
            return reportGeneratorService.generateCsv("Revenue Report", headers, rows);
        } else {
            return reportGeneratorService.generateExcel("Revenue", headers, rows);
        }
    }

    private byte[] processTopProductsReport(LocalDateTime from, LocalDateTime to, String format, Map<String, Object> dataMap) {
        List<Order> orders = orderRepository.findByOrderDateBetween(from, to);

        Map<String, ProductStats> productStats = new HashMap<>();

        for (Order order : orders) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    String productName = item.getProductVariant().getProduct().getName() + " - " + item.getProductVariant().getSku();
                    ProductStats stats = productStats.getOrDefault(productName, new ProductStats(0, BigDecimal.ZERO));

                    stats.quantity += item.getQuantity();
                    stats.revenue = stats.revenue.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

                    productStats.put(productName, stats);
                }
            }
        }

        List<Map<String, Object>> topProducts = productStats.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().revenue.compareTo(e1.getValue().revenue)) // Sort by revenue desc
                .limit(10)
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", entry.getKey());
                    map.put("quantity", entry.getValue().quantity);
                    map.put("revenue", entry.getValue().revenue);
                    return map;
                })
                .collect(Collectors.toList());

        dataMap.put("topProducts", topProducts);
        dataMap.put("summary", "Top 10 Products by Revenue (" + from.toLocalDate() + " - " + to.toLocalDate() + ")");

        // File Generation
        List<String> headers = Arrays.asList("Product", "Quantity Sold", "Revenue");
        List<List<String>> rows = topProducts.stream()
                .map(m -> Arrays.asList(
                m.get("name").toString(),
                m.get("quantity").toString(),
                m.get("revenue").toString()
        ))
                .collect(Collectors.toList());

        if ("PDF".equalsIgnoreCase(format)) {
            return reportGeneratorService.generatePdf("Top Products Report", headers, rows);
        } else if ("CSV".equalsIgnoreCase(format)) {
            return reportGeneratorService.generateCsv("Top Products Report", headers, rows);
        } else {
            return reportGeneratorService.generateExcel("Top Products", headers, rows);
        }
    }

    private byte[] processInventoryReport(String format, Map<String, Object> dataMap) {
        List<InventoryStock> stocks = inventoryStockRepository.findAll();

        // Filter low stock (threshold < 10 for example)
        List<Map<String, Object>> lowStockItems = stocks.stream()
                .filter(s -> s.getQuantity() < 10)
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("product", s.getVariant().getProduct().getName());
                    map.put("sku", s.getVariant().getSku());
                    map.put("quantity", s.getQuantity());
                    map.put("location", s.getLocation() != null ? s.getLocation().getName() : "N/A");
                    return map;
                })
                .collect(Collectors.toList());

        dataMap.put("lowStockItems", lowStockItems);
        dataMap.put("totalItems", stocks.size());
        dataMap.put("lowStockCount", lowStockItems.size());
        dataMap.put("summary", "Inventory Report - Low Stock Items (< 10)");

        // File Generation
        List<String> headers = Arrays.asList("Product", "SKU", "Quantity", "Location");
        List<List<String>> rows = lowStockItems.stream()
                .map(m -> Arrays.asList(
                m.get("product").toString(),
                m.get("sku").toString(),
                m.get("quantity").toString(),
                m.get("location").toString()
        ))
                .collect(Collectors.toList());

        if ("PDF".equalsIgnoreCase(format)) {
            return reportGeneratorService.generatePdf("Inventory Low Stock Report", headers, rows);
        } else if ("CSV".equalsIgnoreCase(format)) {
            return reportGeneratorService.generateCsv("Inventory Low Stock Report", headers, rows);
        } else {
            return reportGeneratorService.generateExcel("Low Stock", headers, rows);
        }
    }

    private byte[] processCustomerReport(LocalDateTime from, LocalDateTime to, String format, Map<String, Object> dataMap) {
        // Basic implementation for now
        List<Order> orders = orderRepository.findByOrderDateBetween(from, to);

        Map<String, DailyStats> customerStats = new HashMap<>(); // Reusing DailyStats for revenue/count

        for (Order order : orders) {
            String customerName = order.getCustomer() != null ? order.getCustomer().getName() : "Walk-in Customer";
            DailyStats stats = customerStats.getOrDefault(customerName, new DailyStats(BigDecimal.ZERO, 0));

            stats.revenue = stats.revenue.add(order.getTotalAmount());
            stats.orderCount++;

            customerStats.put(customerName, stats);
        }

        List<Map<String, Object>> topCustomers = customerStats.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().revenue.compareTo(e1.getValue().revenue))
                .limit(20)
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", entry.getKey());
                    map.put("orders", entry.getValue().orderCount);
                    map.put("spent", entry.getValue().revenue);
                    return map;
                })
                .collect(Collectors.toList());

        dataMap.put("topCustomers", topCustomers);
        dataMap.put("summary", "Top Customers by Spending");

        List<String> headers = Arrays.asList("Customer", "Orders", "Total Spent");
        List<List<String>> rows = topCustomers.stream()
                .map(m -> Arrays.asList(
                m.get("name").toString(),
                m.get("orders").toString(),
                m.get("spent").toString()
        ))
                .collect(Collectors.toList());

        if ("PDF".equalsIgnoreCase(format)) {
            return reportGeneratorService.generatePdf("Customer Analysis", headers, rows);
        } else if ("CSV".equalsIgnoreCase(format)) {
            return reportGeneratorService.generateCsv("Customer Analysis", headers, rows);
        } else {
            return reportGeneratorService.generateExcel("Customers", headers, rows);
        }
    }

    // Helper classes
    static class DailyStats {

        BigDecimal revenue;
        int orderCount;

        public DailyStats(BigDecimal revenue, int orderCount) {
            this.revenue = revenue;
            this.orderCount = orderCount;
        }
    }

    static class ProductStats {

        int quantity;
        BigDecimal revenue;

        public ProductStats(int quantity, BigDecimal revenue) {
            this.quantity = quantity;
            this.revenue = revenue;
        }
    }
}
