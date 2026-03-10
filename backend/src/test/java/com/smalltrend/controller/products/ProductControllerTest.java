package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.service.products.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test class cho ProductController
 * Kiểm tra các endpoint API liên quan đến sản phẩm
 */
@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    private ProductController productController;

    @BeforeEach
    void setUp() {
        productController = new ProductController(productService, null, null, null);
    }

    // ========== GET ALL TESTS ==========
    @Test
    void getAll_shouldReturnOk() {
        List<ProductResponse> expected = List.of(
                ProductResponse.builder()
                        .id(1)
                        .name("Coca-Cola 330ml")
                        .brand_name("Coca-Cola")
                        .category_name("Đồ uống")
                        .is_active(true)
                        .build()
        );
        when(productService.getAll()).thenReturn(expected);

        ResponseEntity<List<ProductResponse>> response = productController.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(productService).getAll();
    }

    // ========== GET BY ID TESTS ==========
    @Test
    void getById_shouldReturnOk_whenProductExists() {
        ProductResponse expected = ProductResponse.builder()
                .id(5)
                .name("Sữa Vinamilk 1L")
                .brand_name("Vinamilk")
                .category_name("Sữa")
                .is_active(true)
                .variant_count(2)
                .build();
        when(productService.getById(5)).thenReturn(expected);

        ResponseEntity<ProductResponse> response = productController.getById(5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(productService).getById(5);
    }

    @Test
    void getById_shouldThrow_whenProductNotFound() {
        // Kiểm tra khi sản phẩm không tồn tại
        when(productService.getById(999)).thenThrow(new RuntimeException("Product not found with id: 999"));

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> productController.getById(999));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    // ========== CREATE TESTS ==========
    @Test
    void create_shouldReturnOk_whenValid() {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Nước cam Minute Maid")
                .description("Nước cam tươi")
                .categoryId(2)
                .brandId(3)
                .isActive(true)
                .build();
        ProductResponse expected = ProductResponse.builder()
                .id(10)
                .name("Nước cam Minute Maid")
                .brand_id(3)
                .category_id(2)
                .is_active(true)
                .build();
        when(productService.create(request)).thenReturn(expected);

        ResponseEntity<ProductResponse> response = productController.create(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(productService).create(request);
    }

    @Test
    void create_shouldThrow_whenCategoryNotFound() {
        // Kiểm tra khi danh mục không tồn tại
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product")
                .categoryId(999)
                .build();
        when(productService.create(request))
                .thenThrow(new RuntimeException("Category not found with id: 999"));

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> productController.create(request));

        assertEquals("Category not found with id: 999", ex.getMessage());
    }

    @Test
    void create_shouldThrow_whenBrandNotFound() {
        // Kiểm tra khi thương hiệu không tồn tại
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product")
                .brandId(999)
                .build();
        when(productService.create(request))
                .thenThrow(new RuntimeException("Brand not found with id: 999"));

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> productController.create(request));

        assertEquals("Brand not found with id: 999", ex.getMessage());
    }

    // ========== UPDATE TESTS ==========
    @Test
    void update_shouldReturnOk_whenValid() {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Coca-Cola 500ml")
                .description("Cập nhật")
                .categoryId(2)
                .isActive(true)
                .build();
        ProductResponse expected = ProductResponse.builder()
                .id(1)
                .name("Coca-Cola 500ml")
                .category_id(2)
                .is_active(true)
                .build();
        when(productService.update(1, request)).thenReturn(expected);

        ResponseEntity<ProductResponse> response = productController.update(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(productService).update(1, request);
    }

    @Test
    void update_shouldThrow_whenProductNotFound() {
        // Kiểm tra khi sản phẩm không tồn tại
        CreateProductRequest request = CreateProductRequest.builder().name("Test").build();
        when(productService.update(999, request))
                .thenThrow(new RuntimeException("Product not found with id: 999"));

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> productController.update(999, request));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    // ========== TOGGLE STATUS TESTS ==========
    @Test
    void toggleStatus_shouldReturnOk() {
        ResponseEntity<String> response = productController.toggleStatus(5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Product status toggled", response.getBody());
        verify(productService).toggleStatus(5);
    }

    // ========== DELETE TESTS ==========
    @Test
    void delete_shouldReturnOk_whenValid() {
        ResponseEntity<String> response = productController.delete(10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Product deleted", response.getBody());
        verify(productService).delete(10);
    }

    @Test
    void delete_shouldThrow_whenProductNotFound() {
        // Kiểm tra khi sản phẩm không tồn tại
        when(productService.delete(999))
                .thenThrow(new RuntimeException("Product not found with id: 999"));

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> productController.delete(999));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    @Test
    void delete_shouldThrow_whenProductTooOld() {
        // Kiểm tra khi sản phẩm được tạo quá 2 phút
        when(productService.delete(5))
                .thenThrow(new RuntimeException("Sản phẩm đã tạo quá 2 phút, bạn không thể xoá sản phẩm này nữa!"));

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> productController.delete(5));

        assertEquals("Sản phẩm đã tạo quá 2 phút, bạn không thể xoá sản phẩm này nữa!", ex.getMessage());
    }
}
