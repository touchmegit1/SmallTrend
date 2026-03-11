package com.smalltrend.controller.products;

import com.smalltrend.dto.pos.ProductVariantRespone;
import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.CreateVariantRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.dto.products.UnitConversionRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import com.smalltrend.dto.products.UnitRequest;
import com.smalltrend.dto.products.UnitResponse;
import com.smalltrend.service.ProductVariantService;
import com.smalltrend.service.UnitConversionService;
import com.smalltrend.service.UnitService;
import com.smalltrend.service.products.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit Test for ProductController
 */
@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    @Mock
    private ProductVariantService productVariantService;

    @Mock
    private UnitConversionService unitConversionService;

    @Mock
    private UnitService unitService;

    private ProductController productController;

    @BeforeEach
    void setup() {
        productController = new ProductController(productService, productVariantService, unitConversionService, unitService);
    }

    // ==========================================
    // ============= PRODUCT ENDPOINTS ==========
    // ==========================================

    @Test
    void getAll_shouldReturnProductList() {
        List<ProductResponse> products = List.of(ProductResponse.builder().id(1).name("Coca-Cola 330ml").build());
        when(productService.getAll()).thenReturn(products);

        ResponseEntity<List<ProductResponse>> response = productController.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(products, response.getBody());
        verify(productService).getAll();
    }

    @Test
    @DisplayName("Get product by id - success")
    void getById_shouldReturnProduct_whenExists() {
        ProductResponse product = ProductResponse.builder().id(5).name("Sữa Vinamilk").build();
        when(productService.getById(5)).thenReturn(product);

        ResponseEntity<ProductResponse> response = productController.getById(5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(product, response.getBody());
        verify(productService).getById(5);
    }

    @Test
    void create_shouldCreateProductSuccessfully() {
        CreateProductRequest request = CreateProductRequest.builder().name("Nước cam").build();
        ProductResponse responseData = ProductResponse.builder().id(10).name("Nước cam").build();
        when(productService.create(request)).thenReturn(responseData);

        ResponseEntity<ProductResponse> response = productController.create(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productService).create(request);
    }

    @Test
    void update_shouldUpdateProductSuccessfully() {
        CreateProductRequest request = CreateProductRequest.builder().name("Coca-Cola 500ml").build();
        ProductResponse responseData = ProductResponse.builder().id(1).name("Coca-Cola 500ml").build();
        when(productService.update(1, request)).thenReturn(responseData);

        ResponseEntity<ProductResponse> response = productController.update(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productService).update(1, request);
    }

    @Test
    void toggleStatus_shouldToggleProductStatus() {
        ResponseEntity<String> response = productController.toggleStatus(5);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Product status toggled", response.getBody());
        verify(productService).toggleStatus(5);
    }

    @Test
    void delete_shouldDeleteProductSuccessfully() {
        ResponseEntity<String> response = productController.delete(10);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Product deleted", response.getBody());
        verify(productService).delete(10);
    }

    // ==========================================
    // ============= VARIANT ENDPOINTS ==========
    // ==========================================

    @Test
    void getVariantsByProductId_shouldReturnVariants() {
        ProductVariantRespone variant = new ProductVariantRespone();
        variant.setId(1);
        List<ProductVariantRespone> variants = List.of(variant);
        when(productVariantService.getVariantsByProductId(10)).thenReturn(variants);

        ResponseEntity<List<ProductVariantRespone>> response = productController.getVariantsByProductId(10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(variants, response.getBody());
        verify(productVariantService).getVariantsByProductId(10);
    }

    @Test
    void getAllVariants_shouldReturnAllVariantsWithFilters() {
        ProductVariantRespone variant = new ProductVariantRespone();
        List<ProductVariantRespone> variants = List.of(variant);
        when(productVariantService.getAllProductVariants("searchQuery", "barcode123")).thenReturn(variants);

        ResponseEntity<List<ProductVariantRespone>> response = productController.getAllVariants("searchQuery", "barcode123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(variants, response.getBody());
        verify(productVariantService).getAllProductVariants("searchQuery", "barcode123");
    }

    @Test
    void createVariant_shouldCreateVariant() {
        CreateVariantRequest request = new CreateVariantRequest();
        ProductVariantRespone responseData = new ProductVariantRespone();
        when(productVariantService.createVariant(10, request)).thenReturn(responseData);

        ResponseEntity<ProductVariantRespone> response = productController.createVariant(10, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productVariantService).createVariant(10, request);
    }

    @Test
    void updateVariant_shouldUpdateVariant() {
        CreateVariantRequest request = new CreateVariantRequest();
        ProductVariantRespone responseData = new ProductVariantRespone();
        when(productVariantService.updateVariant(5, request)).thenReturn(responseData);

        ResponseEntity<ProductVariantRespone> response = productController.updateVariant(5, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productVariantService).updateVariant(5, request);
    }

    @Test
    void toggleVariantStatus_shouldToggleStatus() {
        ResponseEntity<String> response = productController.toggleVariantStatus(5);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Variant status toggled", response.getBody());
        verify(productVariantService).toggleVariantStatus(5);
    }

    @Test
    void deleteVariant_shouldDeleteVariant() {
        ResponseEntity<String> response = productController.deleteVariant(5);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Variant deleted", response.getBody());
        verify(productVariantService).deleteVariant(5);
    }

    @Test
    void generateSku_shouldReturnGeneratedSku() {
        when(productVariantService.generateSku(10, 5)).thenReturn("SKU-10-5");

        ResponseEntity<Map<String, String>> response = productController.generateSku(10, 5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Map.of("sku", "SKU-10-5"), response.getBody());
        verify(productVariantService).generateSku(10, 5);
    }

    @Test
    void generateBarcode_shouldReturnGeneratedBarcode() {
        when(productVariantService.generateInternalBarcode(10)).thenReturn("BARCODE-10");

        ResponseEntity<Map<String, String>> response = productController.generateBarcode(10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Map.of("barcode", "BARCODE-10"), response.getBody());
        verify(productVariantService).generateInternalBarcode(10);
    }

    // ==========================================
    // =========== CONVERSION ENDPOINTS =========
    // ==========================================

    @Test
    void getConversionsByVariantId_shouldReturnConversions() {
        UnitConversionResponse conversion = new UnitConversionResponse();
        List<UnitConversionResponse> conversions = List.of(conversion);
        when(unitConversionService.getConversionsByVariantId(5)).thenReturn(conversions);

        ResponseEntity<List<UnitConversionResponse>> response = productController.getConversionsByVariantId(5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(conversions, response.getBody());
        verify(unitConversionService).getConversionsByVariantId(5);
    }

    @Test
    void addConversion_shouldAddConversion() {
        UnitConversionRequest request = new UnitConversionRequest();
        UnitConversionResponse responseData = new UnitConversionResponse();
        when(unitConversionService.addConversion(5, request)).thenReturn(responseData);

        ResponseEntity<UnitConversionResponse> response = productController.addConversion(5, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(unitConversionService).addConversion(5, request);
    }

    @Test
    void updateConversion_shouldUpdateConversion() {
        UnitConversionRequest request = new UnitConversionRequest();
        UnitConversionResponse responseData = new UnitConversionResponse();
        when(unitConversionService.updateConversion(3, request)).thenReturn(responseData);

        ResponseEntity<UnitConversionResponse> response = productController.updateConversion(3, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(unitConversionService).updateConversion(3, request);
    }

    @Test
    void deleteConversion_shouldDeleteConversion() {
        ResponseEntity<String> response = productController.deleteConversion(3);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Unit conversion deleted", response.getBody());
        verify(unitConversionService).deleteConversion(3);
    }

    // ==========================================
    // =============== UNIT ENDPOINTS ===========
    // ==========================================

    @Test
    void getAllUnits_shouldReturnAllUnits() {
        UnitResponse unit = new UnitResponse();
        List<UnitResponse> units = List.of(unit);
        when(unitService.getAllUnits()).thenReturn(units);

        ResponseEntity<List<UnitResponse>> response = productController.getAllUnits();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(units, response.getBody());
        verify(unitService).getAllUnits();
    }

    @Test
    void createUnit_shouldCreateUnit() {
        UnitRequest request = new UnitRequest();
        UnitResponse responseData = new UnitResponse();
        when(unitService.createUnit(request)).thenReturn(responseData);

        ResponseEntity<UnitResponse> response = productController.createUnit(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(unitService).createUnit(request);
    }

    @Test
    void updateUnit_shouldUpdateUnit() {
        UnitRequest request = new UnitRequest();
        UnitResponse responseData = new UnitResponse();
        when(unitService.updateUnit(2, request)).thenReturn(responseData);

        ResponseEntity<UnitResponse> response = productController.updateUnit(2, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(unitService).updateUnit(2, request);
    }

    @Test
    void deleteUnit_shouldDeleteUnit() {
        ResponseEntity<String> response = productController.deleteUnit(2);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Unit deleted", response.getBody());
        verify(unitService).deleteUnit(2);
    }
}
