package com.smalltrend.dto.inventory.purchaseorder;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PurchaseOrderValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setupValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        if (validatorFactory != null) {
            validatorFactory.close();
        }
    }

    @Test
    void purchaseOrderRequest_shouldRejectEmptyItems() {
        PurchaseOrderRequest request = PurchaseOrderRequest.builder()
                .items(List.of())
                .build();

        Set<ConstraintViolation<PurchaseOrderRequest>> violations = validator.validate(request);
        Set<String> fields = violations.stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());

        assertTrue(fields.contains("items"));
    }

    @Test
    void purchaseOrderItemRequest_shouldRejectInvalidCoreFields() {
        PurchaseOrderItemRequest item = PurchaseOrderItemRequest.builder()
                .variantId(null)
                .quantity(0)
                .unitCost(new BigDecimal("-1"))
                .build();

        Set<ConstraintViolation<PurchaseOrderItemRequest>> violations = validator.validate(item);
        Set<String> fields = violations.stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());

        assertTrue(fields.contains("variantId"));
        assertTrue(fields.contains("quantity"));
        assertTrue(fields.contains("unitCost"));
    }

    @Test
    void goodsReceiptRequest_shouldRejectNegativeFinanceAndEmptyItems() {
        GoodsReceiptRequest request = GoodsReceiptRequest.builder()
                .shippingFee(new BigDecimal("-10"))
                .items(List.of())
                .build();

        Set<ConstraintViolation<GoodsReceiptRequest>> violations = validator.validate(request);
        Set<String> fields = violations.stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());

        assertTrue(fields.contains("shippingFee"));
        assertTrue(fields.contains("items"));
    }

    @Test
    void goodsReceiptRequest_shouldValidateNestedItem() {
        GoodsReceiptRequest.GoodsReceiptItemRequest invalidItem = GoodsReceiptRequest.GoodsReceiptItemRequest.builder()
                .itemId(null)
                .receivedQuantity(-1)
                .unitCost(null)
                .build();

        GoodsReceiptRequest request = GoodsReceiptRequest.builder()
                .items(List.of(invalidItem))
                .build();

        Set<ConstraintViolation<GoodsReceiptRequest>> violations = validator.validate(request);
        Set<String> fields = violations.stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());

        assertTrue(fields.contains("items[0].itemId"));
        assertTrue(fields.contains("items[0].receivedQuantity"));
        assertTrue(fields.contains("items[0].unitCost"));
    }

    @Test
    void purchaseOrderItemRequest_shouldRejectExpiryDateBelowSixMonths() {
        PurchaseOrderItemRequest item = PurchaseOrderItemRequest.builder()
                .variantId(1)
                .quantity(1)
                .unitCost(BigDecimal.ONE)
                .expiryDate(LocalDate.now().plusMonths(5))
                .build();

        Set<ConstraintViolation<PurchaseOrderItemRequest>> violations = validator.validate(item);
        Set<String> fields = violations.stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());

        assertTrue(fields.contains("expiryDateAtLeastSixMonths"));
    }

    @Test
    void goodsReceiptRequest_shouldRejectNestedExpiryDateBelowSixMonths() {
        GoodsReceiptRequest.GoodsReceiptItemRequest invalidItem = GoodsReceiptRequest.GoodsReceiptItemRequest.builder()
                .itemId(1)
                .receivedQuantity(1)
                .unitCost(BigDecimal.ONE)
                .expiryDate(LocalDate.now().plusMonths(5))
                .build();

        GoodsReceiptRequest request = GoodsReceiptRequest.builder()
                .items(List.of(invalidItem))
                .build();

        Set<ConstraintViolation<GoodsReceiptRequest>> violations = validator.validate(request);
        Set<String> fields = violations.stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());

        assertTrue(fields.contains("items[0].expiryDateAtLeastSixMonths"));
    }
}
