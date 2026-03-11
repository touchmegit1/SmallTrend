package com.smalltrend.service.products;

import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.entity.Brand;
import com.smalltrend.entity.Category;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.BrandRepository;
import com.smalltrend.repository.CategoryRepository;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.repository.TaxRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test class cho ProductService
 * Kiểm tra business logic của sản phẩm
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TaxRateRepository taxRateRepository;

    private ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductServiceImpl(productRepository, brandRepository, categoryRepository, taxRateRepository);
    }

    // ========== GET ALL TESTS ==========
    @Test
    void getAll_shouldReturnAllProducts() {
        Product product1 = buildProduct(1, "Coca-Cola 330ml", true);
        Product product2 = buildProduct(2, "Sữa Vinamilk 1L", true);
        when(productRepository.findAll()).thenReturn(List.of(product1, product2));

        List<ProductResponse> result = productService.getAll();

        assertEquals(2, result.size());
        assertEquals("Coca-Cola 330ml", result.get(0).getName());
        assertEquals("Sữa Vinamilk 1L", result.get(1).getName());
        verify(productRepository).findAll();
    }

    @Test
    void getAll_shouldReturnEmptyList_whenNoProducts() {
        // Kiểm tra khi không có sản phẩm
        when(productRepository.findAll()).thenReturn(List.of());

        List<ProductResponse> result = productService.getAll();

        assertEquals(0, result.size());
    }

    // ========== GET BY ID TESTS ==========
    @Test
    void getById_shouldReturnProduct_whenExists() {
        Product product = buildProduct(5, "Nước cam Minute Maid", true);
        when(productRepository.findById(5)).thenReturn(Optional.of(product));

        ProductResponse result = productService.getById(5);

        assertNotNull(result);
        assertEquals(5, result.getId());
        assertEquals("Nước cam Minute Maid", result.getName());
        assertTrue(result.getIs_active());
    }

    @Test
    void getById_shouldThrow_whenProductNotFound() {
        // Kiểm tra khi sản phẩm không tồn tại
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.getById(999));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    // ========== CREATE TESTS ==========
    @Test
    void create_shouldSaveProduct_withValidRequest() {
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Bia Heineken 330ml")
                .description("Bia nhập khẩu")
                .categoryId(3)
                .brandId(4)
                .isActive(true)
                .build();

        Category category = buildCategory(3, "Bia");
        Brand brand = buildBrand(4, "Heineken");
        Product savedProduct = buildProduct(15, "Bia Heineken 330ml", true);
        savedProduct.setCategory(category);
        savedProduct.setBrand(brand);

        when(categoryRepository.findById(3)).thenReturn(Optional.of(category));
        when(brandRepository.findById(4)).thenReturn(Optional.of(brand));
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductResponse result = productService.create(request);

        assertEquals(15, result.getId());
        assertEquals("Bia Heineken 330ml", result.getName());
        assertEquals("Heineken", result.getBrand_name());
        assertEquals("Bia", result.getCategory_name());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void create_shouldThrow_whenCategoryNotFound() {
        // Kiểm tra khi danh mục không tồn tại
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product")
                .categoryId(999)
                .build();
        when(categoryRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.create(request));

        assertEquals("Category not found with id: 999", ex.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    void create_shouldThrow_whenBrandNotFound() {
        // Kiểm tra khi thương hiệu không tồn tại
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product")
                .brandId(999)
                .build();
        when(brandRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.create(request));

        assertEquals("Brand not found with id: 999", ex.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    void create_shouldThrow_whenTaxRateNotFound() {
        // Kiểm tra khi thuế suất không tồn tại
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product")
                .taxRateId(999)
                .build();
        when(taxRateRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.create(request));

        assertEquals("TaxRate not found with id: 999", ex.getMessage());
        verify(productRepository, never()).save(any());
    }

    // ========== UPDATE TESTS ==========
    @Test
    void update_shouldUpdateProduct_whenValid() {
        Product existing = buildProduct(7, "Coca-Cola 330ml", true);
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Coca-Cola 500ml")
                .description("Cập nhật kích thước")
                .categoryId(2)
                .isActive(true)
                .build();

        Category category = buildCategory(2, "Đồ uống");
        Product updated = buildProduct(7, "Coca-Cola 500ml", true);
        updated.setCategory(category);

        when(productRepository.findById(7)).thenReturn(Optional.of(existing));
        when(categoryRepository.findById(2)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(updated);

        ProductResponse result = productService.update(7, request);

        assertEquals(7, result.getId());
        assertEquals("Coca-Cola 500ml", result.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void update_shouldThrow_whenProductNotFound() {
        // Kiểm tra khi sản phẩm không tồn tại
        CreateProductRequest request = CreateProductRequest.builder().name("Test").build();
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.update(999, request));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    @Test
    void update_shouldPropagateStatusToVariants_whenStatusChanged() {
        // Kiểm tra cập nhật trạng thái cho tất cả biến thể
        ProductVariant variant1 = buildVariant(1, "Variant 1", true);
        ProductVariant variant2 = buildVariant(2, "Variant 2", true);
        Product existing = buildProduct(8, "Product", true);
        existing.setVariants(List.of(variant1, variant2));

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product Updated")
                .isActive(false)
                .build();

        Product updated = buildProduct(8, "Product Updated", false);
        updated.setVariants(List.of(variant1, variant2));

        when(productRepository.findById(8)).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenReturn(updated);

        productService.update(8, request);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        Product saved = captor.getValue();
        assertFalse(saved.getIsActive());
        saved.getVariants().forEach(v -> assertFalse(v.isActive()));
    }

    // ========== DELETE TESTS ==========
    @Test
    void delete_shouldDeleteProduct_whenWithin2Minutes() {
        LocalDateTime createdAt = LocalDateTime.now().minusSeconds(30);
        Product product = buildProduct(10, "New Product", true);
        product.setCreatedAt(createdAt);

        when(productRepository.findById(10)).thenReturn(Optional.of(product));

        productService.delete(10);

        verify(productRepository).deleteById(10);
    }

    @Test
    void delete_shouldThrow_whenProductOlderThan2Minutes() {
        // Kiểm tra khi sản phẩm được tạo quá 2 phút
        LocalDateTime createdAt = LocalDateTime.now().minusMinutes(3);
        Product product = buildProduct(11, "Old Product", true);
        product.setCreatedAt(createdAt);

        when(productRepository.findById(11)).thenReturn(Optional.of(product));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.delete(11));

        assertEquals("Sản phẩm đã tạo quá 2 phút, bạn không thể xoá sản phẩm này nữa!", ex.getMessage());
        verify(productRepository, never()).deleteById(any());
    }

    @Test
    void delete_shouldThrow_whenProductNotFound() {
        // Kiểm tra khi sản phẩm không tồn tại
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.delete(999));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    // ========== TOGGLE STATUS TESTS ==========
    @Test
    void toggleStatus_shouldToggleProductStatus() {
        Product product = buildProduct(12, "Product", true);
        Product toggled = buildProduct(12, "Product", false);

        when(productRepository.findById(12)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(toggled);

        productService.toggleStatus(12);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertFalse(captor.getValue().getIsActive());
    }

    @Test
    void toggleStatus_shouldPropagateToVariants() {
        // Kiểm tra cập nhật trạng thái cho tất cả biến thể
        ProductVariant variant1 = buildVariant(1, "V1", true);
        ProductVariant variant2 = buildVariant(2, "V2", true);
        Product product = buildProduct(13, "Product", true);
        product.setVariants(List.of(variant1, variant2));

        when(productRepository.findById(13)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        productService.toggleStatus(13);

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        Product saved = captor.getValue();
        saved.getVariants().forEach(v -> assertFalse(v.isActive()));
    }

    @Test
    void toggleStatus_shouldThrow_whenProductNotFound() {
        // Kiểm tra khi sản phẩm không tồn tại
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.toggleStatus(999));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    // ========== HELPER METHODS ==========
    private Product buildProduct(Integer id, String name, Boolean isActive) {
        return Product.builder()
                .id(id)
                .name(name)
                .description("Description for " + name)
                .isActive(isActive)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private Category buildCategory(Integer id, String name) {
        return Category.builder()
                .id(id)
                .name(name)
                .build();
    }

    private Brand buildBrand(Integer id, String name) {
        return Brand.builder()
                .id(id)
                .name(name)
                .build();
    }

    private ProductVariant buildVariant(Integer id, String sku, Boolean isActive) {
        return ProductVariant.builder()
                .id(id)
                .sku(sku)
                .isActive(isActive)
                .build();
    }
}
