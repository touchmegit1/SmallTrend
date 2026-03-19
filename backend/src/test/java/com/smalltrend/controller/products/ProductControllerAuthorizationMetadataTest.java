package com.smalltrend.controller.products;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductControllerAuthorizationMetadataTest {

    private String preAuthorizeValue(String methodName, Class<?>... parameterTypes) throws Exception {
        Method method = ProductController.class.getDeclaredMethod(methodName, parameterTypes);
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
        assertNotNull(preAuthorize, "Method " + methodName + " must declare @PreAuthorize");
        return preAuthorize.value();
    }

    @Test
    void getAll_shouldAllowManagerAndStaffRoles() throws Exception {
        String expression = preAuthorizeValue("getAll");
        assertTrue(expression.contains("MANAGER"));
        assertTrue(expression.contains("CASHIER"));
        assertTrue(expression.contains("INVENTORY_STAFF"));
        assertTrue(expression.contains("SALES_STAFF"));
    }

    @Test
    void create_shouldBeManagerOnly() throws Exception {
        String expression = preAuthorizeValue("create", com.smalltrend.dto.products.CreateProductRequest.class);
        assertTrue(expression.contains("MANAGER"));
        assertTrue(!expression.contains("CASHIER"));
        assertTrue(!expression.contains("INVENTORY_STAFF"));
    }

    @Test
    void toggleStatus_shouldBeManagerOnly() throws Exception {
        String expression = preAuthorizeValue("toggleStatus", Integer.class);
        assertTrue(expression.contains("MANAGER"));
        assertTrue(!expression.contains("CASHIER"));
    }
}
