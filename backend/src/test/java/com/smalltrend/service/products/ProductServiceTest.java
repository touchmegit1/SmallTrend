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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test class cho ProductService Kiểm tra business logic của sản phẩm Mục tiêu:
 * 100% statement coverage + decision coverage
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
    @DisplayName("getAll - trả về danh sách sản phẩm")
    void getAll_shouldReturnAllProducts() {
        // Arrange
        Product product1 = buildProduct(1, "Coca-Cola 330ml", true);
        Product product2 = buildProduct(2, "Sữa Vinamilk 1L", true);
        when(productRepository.findAll()).thenReturn(List.of(product1, product2));

        // Act
        List<ProductResponse> result = productService.getAll();

        // Assert
        assertEquals(2, result.size());
        assertEquals("Coca-Cola 330ml", result.get(0).getName());
        assertEquals("Sữa Vinamilk 1L", result.get(1).getName());
        verify(productRepository).findAll();
    }

    @Test
    @DisplayName("getAll - trả về danh sách rỗng khi không có sản phẩm")
    void getAll_shouldReturnEmptyList_whenNoProducts() {
        // Arrange
        when(productRepository.findAll()).thenReturn(List.of());

        // Act
        List<ProductResponse> result = productService.getAll();

        // Assert
        assertEquals(0, result.size());
    }

    @Test
    @DisplayName("getAll - mapToResponse với đầy đủ brand, category, taxRate, variants")
    void getAll_shouldMapAllFields_whenBrandCategoryTaxRateVariantsPresent() {
        // Arrange: Cover tất cả nhánh TRUE trong mapToResponse:
        // brand != null → TRUE, category != null → TRUE,
        // taxRate != null → TRUE, variants != null → TRUE
        Brand brand = Brand.builder().id(4).name("Heineken").build();
        Category category = Category.builder().id(3).name("Bia").build();
        TaxRate taxRate = TaxRate.builder().id(1).name("VAT 10%").rate(BigDecimal.valueOf(10)).build();

        Product product = buildProduct(15, "Bia Heineken 330ml", true);
        product.setBrand(brand);
        product.setCategory(category);
        product.setTaxRate(taxRate);
        product.setVariants(List.of(buildVariant(1, "V1", true), buildVariant(2, "V2", true)));

        when(productRepository.findAll()).thenReturn(List.of(product));

        // Act
        List<ProductResponse> result = productService.getAll();

        // Assert
        assertEquals(1, result.size());
        ProductResponse resp = result.get(0);
        // Verify brand fields
        assertEquals(4, resp.getBrand_id());
        assertEquals("Heineken", resp.getBrand_name());
        // Verify category fields
        assertEquals(3, resp.getCategory_id());
        assertEquals("Bia", resp.getCategory_name());
        // Verify taxRate fields
        assertEquals(1, resp.getTax_rate_id());
        assertEquals("VAT 10%", resp.getTax_rate_name());
        assertEquals(BigDecimal.valueOf(10), resp.getTax_rate_value());
        // Verify variant count
        assertEquals(2, resp.getVariant_count());
    }

    @Test
    @DisplayName("getAll - mapToResponse khi brand có giá trị")
    void getAll_shouldMapBrand_whenBrandExists() {
        // Arrange
        Brand brand = Brand.builder().id(4).name("Heineken").build();
        Product product = buildProduct(15, "Bia test", true);
        product.setBrand(brand);

        when(productRepository.findAll()).thenReturn(List.of(product));

        // Act
        List<ProductResponse> result = productService.getAll();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Heineken", result.get(0).getBrand_name());
    }

    // ========== GET BY ID TESTS ==========
    @Test
    @DisplayName("getById - trả về sản phẩm khi tồn tại")
    void getById_shouldReturnProduct_whenExists() {
        // Arrange
        Product product = buildProduct(5, "Nước cam Minute Maid", true);
        when(productRepository.findById(5)).thenReturn(Optional.of(product));

        // Act
        ProductResponse result = productService.getById(5);

        // Assert
        assertNotNull(result);
        assertEquals(5, result.getId());
        assertEquals("Nước cam Minute Maid", result.getName());
        assertTrue(result.getIs_active());
    }

    @Test
    @DisplayName("getById - ném exception khi sản phẩm không tồn tại")
    void getById_shouldThrow_whenProductNotFound() {
        // Arrange
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.getById(999));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    // ========== CREATE TESTS ==========
    @Test
    @DisplayName("create - tạo sản phẩm thành công với đầy đủ category, brand, taxRate")
    void create_shouldSaveProduct_withAllFields() {
        // Arrange: Cover: categoryId != null → TRUE, brandId != null → TRUE,
        //        taxRateId != null → TRUE, isActive != null → TRUE
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Bia Heineken 330ml")
                .description("Bia nhập khẩu")
                .categoryId(3)
                .brandId(4)
                .taxRateId(1)
                .isActive(true)
                .build();

        Category category = buildCategory(3, "Bia");
        Brand brand = buildBrand(4, "Heineken");
        TaxRate taxRate = TaxRate.builder().id(1).name("VAT 10%").rate(BigDecimal.valueOf(10)).build();

        Product savedProduct = buildProduct(15, "Bia Heineken 330ml", true);
        savedProduct.setCategory(category);
        savedProduct.setBrand(brand);
        savedProduct.setTaxRate(taxRate);

        when(categoryRepository.findById(3)).thenReturn(Optional.of(category));
        when(brandRepository.findById(4)).thenReturn(Optional.of(brand));
        when(taxRateRepository.findById(1)).thenReturn(Optional.of(taxRate));
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // Act
        ProductResponse result = productService.create(request);

        // Assert
        assertEquals(15, result.getId());
        assertEquals("Bia Heineken 330ml", result.getName());
        assertEquals("Heineken", result.getBrand_name());
        assertEquals("Bia", result.getCategory_name());
        assertEquals("VAT 10%", result.getTax_rate_name());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("create - isActive mặc định true khi isActive null")
    void create_shouldSetDefaultActive_whenIsActiveNull() {
        // Arrange: Cover nhánh: isActive != null → FALSE → default true
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Sản phẩm test")
                .isActive(null)
                .build();

        Product savedProduct = buildProduct(20, "Sản phẩm test", true);
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // Act
        ProductResponse result = productService.create(request);

        // Assert
        assertEquals(20, result.getId());
        assertTrue(result.getIs_active());

        // Verify isActive được set = true
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertTrue(captor.getValue().getIsActive());
    }

    @Test
    @DisplayName("create - categoryId, brandId, taxRateId null → set null")
    void create_shouldSetNulls_whenIdsAreNull() {
        // Arrange: Cover nhánh: categoryId != null → FALSE, brandId != null → FALSE,
        //              taxRateId != null → FALSE
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Sản phẩm không phân loại")
                .categoryId(null)
                .brandId(null)
                .taxRateId(null)
                .isActive(true)
                .build();

        Product savedProduct = buildProduct(21, "Sản phẩm không phân loại", true);
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        // Act
        ProductResponse result = productService.create(request);

        // Assert
        assertEquals(21, result.getId());
        assertNull(result.getBrand_name());
        assertNull(result.getCategory_name());

        // Verify product fields set to null
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertNull(captor.getValue().getCategory());
        assertNull(captor.getValue().getBrand());
        assertNull(captor.getValue().getTaxRate());
    }

    @Test
    @DisplayName("create - ném exception khi category không tồn tại")
    void create_shouldThrow_whenCategoryNotFound() {
        // Arrange
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product")
                .categoryId(999)
                .build();
        when(categoryRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.create(request));

        assertEquals("Category not found with id: 999", ex.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("create - ném exception khi brand không tồn tại")
    void create_shouldThrow_whenBrandNotFound() {
        // Arrange
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product")
                .brandId(999)
                .build();
        when(brandRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.create(request));

        assertEquals("Brand not found with id: 999", ex.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("create - ném exception khi taxRate không tồn tại")
    void create_shouldThrow_whenTaxRateNotFound() {
        // Arrange
        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product")
                .taxRateId(999)
                .build();
        when(taxRateRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.create(request));

        assertEquals("TaxRate not found with id: 999", ex.getMessage());
        verify(productRepository, never()).save(any());
    }

    // ========== UPDATE TESTS ==========
    @Test
    @DisplayName("update - cập nhật sản phẩm thành công")
    void update_shouldUpdateProduct_whenValid() {
        // Arrange
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

        // Act
        ProductResponse result = productService.update(7, request);

        // Assert
        assertEquals(7, result.getId());
        assertEquals("Coca-Cola 500ml", result.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("update - ném exception khi sản phẩm không tồn tại")
    void update_shouldThrow_whenProductNotFound() {
        // Arrange
        CreateProductRequest request = CreateProductRequest.builder().name("Test").build();
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.update(999, request));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    @Test
    @DisplayName("update - lan truyền trạng thái xuống variants khi status thay đổi")
    void update_shouldPropagateStatusToVariants_whenStatusChanged() {
        // Arrange: Cover: oldStatus != newStatus → TRUE, variants != null → TRUE
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

        // Act
        productService.update(8, request);

        // Assert
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        Product saved = captor.getValue();
        assertFalse(saved.getIsActive());
        saved.getVariants().forEach(v -> assertFalse(v.isActive()));
    }

    @Test
    @DisplayName("update - không lan truyền khi status không thay đổi")
    void update_shouldNotPropagateToVariants_whenStatusUnchanged() {
        // Arrange: Cover: oldStatus != newStatus → FALSE
        ProductVariant variant = buildVariant(1, "V1", true);
        Product existing = buildProduct(9, "Product", true);
        existing.setVariants(List.of(variant));

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product Renamed")
                .isActive(true) // same status
                .build();

        Product updated = buildProduct(9, "Product Renamed", true);
        updated.setVariants(List.of(variant));

        when(productRepository.findById(9)).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenReturn(updated);

        // Act
        productService.update(9, request);

        // Assert: Variant vẫn giữ nguyên trạng thái true
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        Product saved = captor.getValue();
        assertTrue(saved.getIsActive());
        saved.getVariants().forEach(v -> assertTrue(v.isActive()));
    }

    @Test
    @DisplayName("update - status thay đổi nhưng variants null → không lỗi")
    void update_shouldNotFail_whenStatusChangedButVariantsNull() {
        // Arrange: Cover: oldStatus != newStatus → TRUE, variants != null → FALSE (variants == null)
        Product existing = buildProduct(10, "Product", true);
        existing.setVariants(null);

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product Updated")
                .isActive(false)
                .build();

        Product updated = buildProduct(10, "Product Updated", false);

        when(productRepository.findById(10)).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenReturn(updated);

        // Act
        ProductResponse result = productService.update(10, request);

        // Assert
        assertEquals(10, result.getId());
        assertFalse(result.getIs_active());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("update - isActive null trên existing → default true")
    void update_shouldUseDefaultStatus_whenExistingIsActiveNull() {
        // Arrange: Cover: existing.getIsActive() != null → FALSE trong dòng oldStatus
        Product existing = buildProduct(11, "Product", null);
        existing.setIsActive(null); // isActive = null

        CreateProductRequest request = CreateProductRequest.builder()
                .name("Product Updated")
                .isActive(false)
                .build();

        Product updated = buildProduct(11, "Product Updated", false);

        when(productRepository.findById(11)).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenReturn(updated);

        // Act
        productService.update(11, request);

        // Assert
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertFalse(captor.getValue().getIsActive());
    }

    // ========== DELETE TESTS ==========
    @Test
    @DisplayName("delete - xóa thành công khi sản phẩm tạo trong 2 phút")
    void delete_shouldDeleteProduct_whenWithin2Minutes() {
        // Arrange
        LocalDateTime createdAt = LocalDateTime.now().minusSeconds(30);
        Product product = buildProduct(10, "New Product", true);
        product.setCreatedAt(createdAt);

        when(productRepository.findById(10)).thenReturn(Optional.of(product));

        // Act
        productService.delete(10);

        // Assert
        verify(productRepository).deleteById(10);
    }

    @Test
    @DisplayName("delete - ném exception khi sản phẩm tạo quá 2 phút")
    void delete_shouldThrow_whenProductOlderThan2Minutes() {
        // Arrange
        LocalDateTime createdAt = LocalDateTime.now().minusMinutes(3);
        Product product = buildProduct(11, "Old Product", true);
        product.setCreatedAt(createdAt);

        when(productRepository.findById(11)).thenReturn(Optional.of(product));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.delete(11));

        assertEquals("Sản phẩm đã tạo quá 2 phút, bạn không thể xoá sản phẩm này nữa!", ex.getMessage());
        verify(productRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("delete - xóa thành công khi createdAt null")
    void delete_shouldDeleteProduct_whenCreatedAtNull() {
        // Arrange: Cover: createdAt != null → FALSE
        Product product = buildProduct(12, "Product No Date", true);
        product.setCreatedAt(null);

        when(productRepository.findById(12)).thenReturn(Optional.of(product));

        // Act
        productService.delete(12);

        // Assert
        verify(productRepository).deleteById(12);
    }

    @Test
    @DisplayName("delete - ném exception khi sản phẩm không tồn tại")
    void delete_shouldThrow_whenProductNotFound() {
        // Arrange
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> productService.delete(999));

        assertEquals("Product not found with id: 999", ex.getMessage());
    }

    // ========== TOGGLE STATUS TESTS ==========
    @Test
    @DisplayName("toggleStatus - đảo trạng thái sản phẩm và lan truyền xuống variants")
    void toggleStatus_shouldToggleAndPropagateToVariants() {
        // Arrange: Cover: variants != null → TRUE
        ProductVariant variant1 = buildVariant(1, "V1", true);
        ProductVariant variant2 = buildVariant(2, "V2", true);
        Product product = buildProduct(13, "Product", true);
        product.setVariants(List.of(variant1, variant2));

        when(productRepository.findById(13)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        productService.toggleStatus(13);

        // Assert
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        Product saved = captor.getValue();
        assertFalse(saved.getIsActive());
        saved.getVariants().forEach(v -> assertFalse(v.isActive()));
    }

    @Test
    @DisplayName("toggleStatus - đảo trạng thái khi variants null → không lỗi")
    void toggleStatus_shouldWork_whenVariantsNull() {
        // Arrange: Cover: variants != null → FALSE
        Product product = buildProduct(14, "Product No Variants", true);
        product.setVariants(null);

        when(productRepository.findById(14)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        productService.toggleStatus(14);

        // Assert
        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertFalse(captor.getValue().getIsActive());
    }

    @Test
    @DisplayName("toggleStatus - ném exception khi sản phẩm không tồn tại")
    void toggleStatus_shouldThrow_whenProductNotFound() {
        // Arrange
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
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
