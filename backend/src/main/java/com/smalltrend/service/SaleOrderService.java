package com.smalltrend.service;

import com.smalltrend.dto.order.OrderItemRequest;
import com.smalltrend.dto.order.OrderItemResponse;
import com.smalltrend.dto.order.OrderRequest;
import com.smalltrend.dto.order.OrderResponse;
import com.smalltrend.dto.order.OrderStatusHistoryResponse;
import com.smalltrend.dto.order.OrderStatusUpdateRequest;
import com.smalltrend.entity.CashRegister;
import com.smalltrend.entity.Customer;
import com.smalltrend.entity.Order;
import com.smalltrend.entity.OrderItem;
import com.smalltrend.entity.OrderStatusHistory;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.User;
import com.smalltrend.repository.CashRegisterRepository;
import com.smalltrend.repository.CustomerRepository;
import com.smalltrend.repository.OrderRepository;
import com.smalltrend.repository.OrderStatusHistoryRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleOrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CashRegisterRepository cashRegisterRepository;

    public List<OrderResponse> listOrders(String status, Integer cashierId, LocalDate fromDate, LocalDate toDate) {
        List<Order> orders = orderRepository.findAll().stream()
                .sorted(Comparator.comparing(Order::getOrderDate, Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
                .collect(Collectors.toList());

        return orders.stream()
                .filter(order -> {
                    if (status == null || status.isBlank()) {
                        return true;
                    }
                    return order.getStatus() != null && order.getStatus().equalsIgnoreCase(status.trim());
                })
                .filter(order -> {
                    if (cashierId == null) {
                        return true;
                    }
                    return order.getCashier() != null && cashierId.equals(order.getCashier().getId());
                })
                .filter(order -> {
                    if (fromDate == null && toDate == null) {
                        return true;
                    }
                    if (order.getOrderDate() == null) {
                        return false;
                    }
                    LocalDate valueDate = order.getOrderDate().toLocalDate();
                    boolean okFrom = fromDate == null || !valueDate.isBefore(fromDate);
                    boolean okTo = toDate == null || !valueDate.isAfter(toDate);
                    return okFrom && okTo;
                })
                .map(order -> toOrderResponse(order, false, false))
                .collect(Collectors.toList());
    }

    public OrderResponse getById(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale order not found: " + id));
        return toOrderResponse(order, true, true);
    }

    public OrderResponse getByOrderCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Sale order not found: " + orderCode));
        return toOrderResponse(order, true, true);
    }

    @Transactional
    public OrderResponse create(OrderRequest request) {
        validateRequest(request);

        Order order = new Order();
        applyHeader(order, request, true);
        List<OrderItem> items = buildItems(order, request.getItems());
        order.setItems(items);

        calculateTotals(order, items);

        Order saved = orderRepository.save(order);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(saved)
                .fromStatus(null)
                .toStatus(saved.getStatus())
                .actionType("CREATED")
                .changedBy(saved.getCashier())
                .changeNotes("Order created")
                .build();
        orderStatusHistoryRepository.save(history);

        return getById(saved.getId());
    }

    @Transactional
    public OrderResponse update(Integer id, OrderRequest request) {
        validateRequest(request);

        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale order not found: " + id));

        String previousStatus = normalizeStatus(existing.getStatus());

        applyHeader(existing, request, false);

        existing.getItems().clear();
        List<OrderItem> items = buildItems(existing, request.getItems());
        existing.getItems().addAll(items);
        calculateTotals(existing, items);

        Order saved = orderRepository.save(existing);

        String currentStatus = normalizeStatus(saved.getStatus());
        if (!previousStatus.equals(currentStatus)) {
            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(saved)
                    .fromStatus(previousStatus)
                    .toStatus(currentStatus)
                    .actionType("STATUS_UPDATED")
                    .changedBy(saved.getCashier())
                    .changeNotes("Order updated")
                    .build();
            orderStatusHistoryRepository.save(history);
        }

        return getById(saved.getId());
    }

    @Transactional
    public OrderResponse updateStatus(Integer id, OrderStatusUpdateRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().isBlank()) {
            throw new RuntimeException("Status is required");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale order not found: " + id));

        String fromStatus = normalizeStatus(order.getStatus());
        String toStatus = normalizeStatus(request.getStatus());
        order.setStatus(toStatus);

        User changedBy = null;
        if (request.getChangedByUserId() != null) {
            changedBy = userRepository.findById(request.getChangedByUserId())
                    .orElseThrow(() -> new RuntimeException("User not found: " + request.getChangedByUserId()));
        }

        Order saved = orderRepository.save(order);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(saved)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .actionType(request.getActionType() != null && !request.getActionType().isBlank()
                        ? request.getActionType().trim().toUpperCase(Locale.ROOT)
                        : "STATUS_UPDATED")
                .changedBy(changedBy != null ? changedBy : saved.getCashier())
                .changeNotes(request.getChangeNotes())
                .build();
        orderStatusHistoryRepository.save(history);

        return getById(saved.getId());
    }

    @Transactional
    public void delete(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale order not found: " + id));
        orderRepository.delete(order);
    }

    public List<OrderStatusHistoryResponse> listHistory(Integer orderId) {
        return orderStatusHistoryRepository.findByOrderIdOrderByChangedAtDesc(orderId).stream()
                .map(this::toHistoryResponse)
                .collect(Collectors.toList());
    }

    private void validateRequest(OrderRequest request) {
        if (request == null) {
            throw new RuntimeException("Request is required");
        }
        if (request.getCashierId() == null) {
            throw new RuntimeException("Cashier is required");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order items are required");
        }
    }

    private void applyHeader(Order order, OrderRequest request, boolean isCreate) {
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found: " + request.getCustomerId()));
        }
        User cashier = userRepository.findById(request.getCashierId())
                .orElseThrow(() -> new RuntimeException("Cashier not found: " + request.getCashierId()));

        CashRegister cashRegister = null;
        if (request.getCashRegisterId() != null) {
            cashRegister = cashRegisterRepository.findById(request.getCashRegisterId())
                    .orElseThrow(() -> new RuntimeException("Cash register not found: " + request.getCashRegisterId()));
        }

        if (isCreate) {
            String generatedCode = "SO-" + LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE)
                    + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
            order.setOrderCode(request.getOrderCode() != null && !request.getOrderCode().isBlank()
                    ? request.getOrderCode().trim()
                    : generatedCode);
        } else if (request.getOrderCode() != null && !request.getOrderCode().isBlank()) {
            order.setOrderCode(request.getOrderCode().trim());
        }

        if (request.getOrderDate() != null) {
            order.setOrderDate(request.getOrderDate());
        }

        order.setCustomer(customer);
        order.setCashier(cashier);
        order.setCashRegister(cashRegister);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setNotes(request.getNotes());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            order.setStatus(normalizeStatus(request.getStatus()));
        } else if (isCreate && (order.getStatus() == null || order.getStatus().isBlank())) {
            order.setStatus("PENDING");
        }
    }

    private List<OrderItem> buildItems(Order order, List<OrderItemRequest> requests) {
        List<OrderItem> items = new ArrayList<>();
        for (OrderItemRequest itemRequest : requests) {
            if (itemRequest.getProductVariantId() == null) {
                throw new RuntimeException("productVariantId is required");
            }
            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                throw new RuntimeException("quantity must be greater than 0");
            }

            ProductVariant variant = productVariantRepository.findById(itemRequest.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Product variant not found: " + itemRequest.getProductVariantId()));

            BigDecimal unitPrice = itemRequest.getUnitPrice() != null
                    ? itemRequest.getUnitPrice()
                    : (variant.getSellPrice() != null ? variant.getSellPrice() : BigDecimal.ZERO);
            BigDecimal lineDiscount = itemRequest.getLineDiscountAmount() != null
                    ? itemRequest.getLineDiscountAmount()
                    : BigDecimal.ZERO;
            BigDecimal lineTax = itemRequest.getLineTaxAmount() != null
                    ? itemRequest.getLineTaxAmount()
                    : BigDecimal.ZERO;

            BigDecimal lineSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            BigDecimal lineTotal = lineSubtotal.subtract(lineDiscount).add(lineTax);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .productName(variant.getProduct() != null ? variant.getProduct().getName() : null)
                    .sku(variant.getSku())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .lineDiscountAmount(lineDiscount)
                    .lineTaxAmount(lineTax)
                    .lineTotalAmount(lineTotal)
                    .notes(itemRequest.getNotes())
                    .build();
            items.add(item);
        }
        return items;
    }

    private void calculateTotals(Order order, List<OrderItem> items) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;

        for (OrderItem item : items) {
            BigDecimal lineBase = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineBase);
            discount = discount.add(item.getLineDiscountAmount() != null ? item.getLineDiscountAmount() : BigDecimal.ZERO);
            tax = tax.add(item.getLineTaxAmount() != null ? item.getLineTaxAmount() : BigDecimal.ZERO);
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discount);
        order.setTaxAmount(tax);
        order.setTotalAmount(subtotal.subtract(discount).add(tax));
    }

    private OrderResponse toOrderResponse(Order order, boolean includeItems, boolean includeHistories) {
        List<OrderItemResponse> itemResponses = includeItems
                ? order.getItems().stream().map(this::toItemResponse).collect(Collectors.toList())
                : null;
        List<OrderStatusHistoryResponse> historyResponses = includeHistories
                ? orderStatusHistoryRepository.findByOrderIdOrderByChangedAtDesc(order.getId())
                        .stream()
                        .map(this::toHistoryResponse)
                        .collect(Collectors.toList())
                : null;

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getName() : null)
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : null)
                .cashierId(order.getCashier() != null ? order.getCashier().getId() : null)
                .cashierName(order.getCashier() != null ? order.getCashier().getFullName() : null)
                .cashRegisterId(order.getCashRegister() != null ? order.getCashRegister().getId() : null)
                .cashRegisterCode(order.getCashRegister() != null ? order.getCashRegister().getRegisterCode() : null)
                .orderDate(order.getOrderDate())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .histories(historyResponses)
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productVariantId(item.getProductVariant() != null ? item.getProductVariant().getId() : null)
                .productName(item.getProductName())
                .sku(item.getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineDiscountAmount(item.getLineDiscountAmount())
                .lineTaxAmount(item.getLineTaxAmount())
                .lineTotalAmount(item.getLineTotalAmount())
                .notes(item.getNotes())
                .build();
    }

    private OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history) {
        return OrderStatusHistoryResponse.builder()
                .id(history.getId())
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .actionType(history.getActionType())
                .changedByUserId(history.getChangedBy() != null ? history.getChangedBy().getId() : null)
                .changedByName(history.getChangedBy() != null ? history.getChangedBy().getFullName() : null)
                .changeNotes(history.getChangeNotes())
                .changedAt(history.getChangedAt())
                .build();
    }

    private String normalizeStatus(String status) {
        return status == null ? "PENDING" : status.trim().toUpperCase(Locale.ROOT);
    }
}
