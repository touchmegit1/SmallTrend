package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.service.products.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit Test for ProductController
 */
@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    private ProductController productController;

    @BeforeEach
    void setup() {
        productController = new ProductController(productService, null, null, null);
    }

    // ================= GET ALL =================
    @Test
    void getAll_shouldReturnProductList() {

        // Arrange
        List<ProductResponse> products = List.of(
                ProductResponse.builder()
                        .id(1)
                        .name("Coca-Cola 330ml")
                        .brand_name("Coca-Cola")
                        .category_name("Đồ uống")
                        .is_active(true)
                        .build());

        when(productService.getAll()).thenReturn(products);

        // Act
        ResponseEntity<List<ProductResponse>> response = productController.getAll();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(products, response.getBody());
        verify(productService).getAll();
    }

    // ================= GET BY ID =================
    @Test
    @DisplayName("Get product by id - success")
    void getById_shouldReturnProduct_whenExists() {

        ProductResponse product = ProductResponse.builder()
                .id(5)
                .name("Sữa Vinamilk")
                .brand_name("Vinamilk")
                .category_name("Sữa")
                .variant_count(2)
                .is_active(true)
                .build();

        when(productService.getById(5)).thenReturn(product);

        ResponseEntity<ProductResponse> response = productController.getById(5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(product, response.getBody());

        verify(productService).getById(5);
    }

    @Test
    void getById_shouldThrowException_whenProductNotFound() {

        when(productService.getById(999))
                .thenThrow(new RuntimeException("Product not found with id: 999"));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productController.getById(999)
        );

        assertEquals("Product not found with id: 999", exception.getMessage());
    }

    // ================= CREATE =================
    @Test
    void create_shouldCreateProductSuccessfully() {

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Nước cam Minute Maid")
                .description("Nước cam tươi")
                .brandId(3)
                .categoryId(2)
                .isActive(true)
                .build();

        ProductResponse responseData = ProductResponse.builder()
                .id(10)
                .name("Nước cam Minute Maid")
                .brand_id(3)
                .category_id(2)
                .is_active(true)
                .build();

        when(productService.create(request)).thenReturn(responseData);

        ResponseEntity<ProductResponse> response = productController.create(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productService).create(request);
    }

    @Test
    void create_shouldThrowException_whenCategoryNotFound() {

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Test Product")
                .categoryId(999)
                .build();

        when(productService.create(request))
                .thenThrow(new RuntimeException("Category not found with id: 999"));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productController.create(request));

        assertEquals("Category not found with id: 999", exception.getMessage());
    }

    @Test
    void create_shouldThrowException_whenBrandNotFound() {

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Test Product")
                .brandId(999)
                .build();

        when(productService.create(request))
                .thenThrow(new RuntimeException("Brand not found with id: 999"));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productController.create(request));

        assertEquals("Brand not found with id: 999", exception.getMessage());
    }

    // ================= UPDATE =================
    @Test
    void update_shouldUpdateProductSuccessfully() {

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Coca-Cola 500ml")
                .description("Update")
                .categoryId(2)
                .isActive(true)
                .build();

        ProductResponse responseData = ProductResponse.builder()
                .id(1)
                .name("Coca-Cola 500ml")
                .category_id(2)
                .is_active(true)
                .build();

        when(productService.update(1, request)).thenReturn(responseData);

        ResponseEntity<ProductResponse> response = productController.update(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());

        verify(productService).update(1, request);
    }

    @Test
    void update_shouldThrowException_whenProductNotFound() {

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Test")
                .build();

        when(productService.update(999, request))
                .thenThrow(new RuntimeException("Product not found with id: 999"));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productController.update(999, request));

        assertEquals("Product not found with id: 999", exception.getMessage());
    }

    // ================= TOGGLE STATUS =================
    @Test
    void toggleStatus_shouldToggleProductStatus() {

        ResponseEntity<String> response = productController.toggleStatus(5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Product status toggled", response.getBody());

        verify(productService).toggleStatus(5);
    }

    // ================= DELETE =================
    @Test
    void delete_shouldDeleteProductSuccessfully() {

        ResponseEntity<String> response = productController.delete(10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Product deleted", response.getBody());

        verify(productService).delete(10);
    }

    @Test
    void delete_shouldThrowException_whenProductNotFound() {

        doThrow(new RuntimeException("Product not found with id: 999"))
                .when(productService).delete(999);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productController.delete(999));

        assertEquals("Product not found with id: 999", exception.getMessage());
    }

    @Test
    void delete_shouldThrowException_whenProductTooOld() {

        doThrow(new RuntimeException("Sản phẩm đã tạo quá 2 phút, bạn không thể xoá sản phẩm này nữa!"))
                .when(productService).delete(5);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> productController.delete(5));

        assertEquals("Sản phẩm đã tạo quá 2 phút, bạn không thể xoá sản phẩm này nữa!", exception.getMessage());
    }
}
