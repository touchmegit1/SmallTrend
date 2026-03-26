package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.CreateVariantRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.dto.products.ProductVariantRespone;
import com.smalltrend.dto.products.UnitConversionRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import com.smalltrend.dto.products.UnitRequest;
import com.smalltrend.dto.products.UnitResponse;
import com.smalltrend.service.products.PriceExpiryAlertEmailScheduler;
import com.smalltrend.service.products.ProductService;
import com.smalltrend.service.products.ProductVariantService;
import com.smalltrend.service.products.UnitConversionService;
import com.smalltrend.service.products.UnitService;
import com.smalltrend.service.products.VariantPriceService;

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

    @Mock
    private VariantPriceService variantPriceService;

    @Mock
    private PriceExpiryAlertEmailScheduler priceExpiryAlertEmailScheduler;

    private ProductController productController;

    @BeforeEach
    void setup() {
        productController = new ProductController(
                productService,
                productVariantService,
                unitConversionService,
                unitService,
                variantPriceService,
                priceExpiryAlertEmailScheduler
        );
    }

    // ==========================================
    // ============= PRODUCT ENDPOINTS ==========
    // ==========================================

    @Test
    @DisplayName("Lấy danh sách sản phẩm - Thành công")
    void getAll_shouldReturnProductList() {
        // Arrange (Chuẩn bị dữ liệu): Tạo danh sách sản phẩm giả lập
        List<ProductResponse> products = List.of(ProductResponse.builder().id(1).name("Coca-Cola 330ml").build());
        when(productService.getAll()).thenReturn(products);

        // Act (Thực thi): Gọi endpoint lấy tất cả sản phẩm
        ResponseEntity<List<ProductResponse>> response = productController.getAll();

        // Assert (Kiểm tra kết quả): Đảm bảo trả về HTTP 200 OK và danh sách sản phẩm chính xác
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(products, response.getBody());
        verify(productService).getAll(); // Kiểm tra service đã được gọi
    }

    @Test
    @DisplayName("Lấy sản phẩm theo ID - Thành công")
    void getById_shouldReturnProduct_whenExists() {
        // Arrange (Chuẩn bị dữ liệu): Tạo một sản phẩm và cấu hình mock service trả về sản phẩm đó
        ProductResponse product = ProductResponse.builder().id(5).name("Sữa Vinamilk").build();
        when(productService.getById(5)).thenReturn(product);

        // Act (Thực thi): Gọi endpoint lấy sản phẩm theo ID = 5
        ResponseEntity<ProductResponse> response = productController.getById(5);

        // Assert (Kiểm tra kết quả): Đảm bảo trả về HTTP 200 OK và đúng sản phẩm mong muốn
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(product, response.getBody());
        verify(productService).getById(5); // Kiểm tra hàm getById của service được gọi đúng ID
    }

    @Test
    @DisplayName("Tạo mới sản phẩm - Thành công")
    void create_shouldCreateProductSuccessfully() {
        // Arrange (Chuẩn bị dữ liệu): Chuẩn bị request tạo sản phẩm và cấu hình mock trả kết quả
        CreateProductRequest request = CreateProductRequest.builder().name("Nước cam").build();
        ProductResponse responseData = ProductResponse.builder().id(10).name("Nước cam").build();
        when(productService.create(request)).thenReturn(responseData);

        // Act (Thực thi): Gọi endpoint tạo sản phẩm
        ResponseEntity<ProductResponse> response = productController.create(request);

        // Assert (Kiểm tra kết quả): Đảm bảo nhận được HTTP 200 OK kèm theo sản phẩm mới tạo
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productService).create(request); // Kiểm tra service được gọi với payload chuẩn xác
    }

    @Test
    @DisplayName("Cập nhật thông tin sản phẩm - Thành công")
    void update_shouldUpdateProductSuccessfully() {
        // Arrange (Chuẩn bị dữ liệu): Định nghĩa payload mới cho cập nhật
        CreateProductRequest request = CreateProductRequest.builder().name("Coca-Cola 500ml").build();
        ProductResponse responseData = ProductResponse.builder().id(1).name("Coca-Cola 500ml").build();
        when(productService.update(1, request)).thenReturn(responseData);

        // Act (Thực thi): Gọi phương thức update cho sản phẩm ID = 1
        ResponseEntity<ProductResponse> response = productController.update(1, request);

        // Assert (Kiểm tra kết quả): Phản hồi trả về mã 200 OK và đối tượng sau cập nhật
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productService).update(1, request); // Xác minh service thực hiện update ở ID = 1
    }

    @Test
    @DisplayName("Đảo trạng thái (Active/Inactive) của sản phẩm - Thành công")
    void toggleStatus_shouldToggleProductStatus() {
        // Act (Thực thi): Tạm ngưng/kích hoạt hoạt động của sản phẩm bằng ID
        ResponseEntity<String> response = productController.toggleStatus(5);

        // Assert (Kiểm tra kết quả): Trả về phản hồi thành công (HTTP 200 OK)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Đã thay đổi trạng thái sản phẩm", response.getBody());
        verify(productService).toggleStatus(5); // Kiểm tra xem service có thực thi lệnh ở ID đó
    }

    @Test
    @DisplayName("Xóa sản phẩm (nếu rỗng hoặc tạo gần đây) - Thành công")
    void delete_shouldDeleteProductSuccessfully() {
        // Act (Thực thi): Gọi API xóa sản phẩm theo ID = 10
        ResponseEntity<String> response = productController.delete(10);

        // Assert (Kiểm tra kết quả): Xác nhận lệnh Http 200 (OK)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Đã xóa sản phẩm", response.getBody());
        verify(productService).delete(10); // Đảm bảo test được xoá qua service
    }

    // ==========================================
    // ============= VARIANT ENDPOINTS ==========
    // ==========================================

    @Test
    @DisplayName("Lấy danh sách biến thể theo ID sản phẩm")
    void getVariantsByProductId_shouldReturnVariants() {
        // Arrange (Chuẩn bị dữ liệu): Tạo biến thể giả
        ProductVariantRespone variant = new ProductVariantRespone();
        variant.setId(1);
        List<ProductVariantRespone> variants = List.of(variant);
        when(productVariantService.getVariantsByProductId(10)).thenReturn(variants);

        // Act (Thực thi): Gọi endpoint lấy danh sách biến thể theo ID sản phẩm = 10
        ResponseEntity<List<ProductVariantRespone>> response = productController.getVariantsByProductId(10);

        // Assert (Kiểm tra kết quả): Trả về mã HTTP 200 và danh sách biến thể đúng
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(variants, response.getBody());
        verify(productVariantService).getVariantsByProductId(10);
    }

    @Test
    @DisplayName("Lấy tất cả biến thể (có bộ lọc)")
    void getAllVariants_shouldReturnAllVariantsWithFilters() {
        // Arrange (Chuẩn bị dữ liệu): Tạo biến thể trả về từ service khi có filter
        ProductVariantRespone variant = new ProductVariantRespone();
        List<ProductVariantRespone> variants = List.of(variant);
        when(productVariantService.getAllProductVariants("searchQuery", "barcode123")).thenReturn(variants);

        // Act (Thực thi): Gọi endpoint lấy biến thể với các tham số tìm kiếm
        ResponseEntity<List<ProductVariantRespone>> response = productController.getAllVariants("searchQuery", "barcode123");

        // Assert (Kiểm tra kết quả): Nhận được Http 200 và danh sách dữ liệu chính xác
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(variants, response.getBody());
        verify(productVariantService).getAllProductVariants("searchQuery", "barcode123"); // Service được gọi đúng params
    }

    @Test
    @DisplayName("Tạo biến thể mới")
    void createVariant_shouldCreateVariant() {
        // Arrange (Chuẩn bị dữ liệu): Request tạo biến thể và dữ liệu mock
        CreateVariantRequest request = new CreateVariantRequest();
        ProductVariantRespone responseData = new ProductVariantRespone();
        when(productVariantService.createVariant(10, request)).thenReturn(responseData);

        // Act (Thực thi): Thực hiện tạo biến thể cho sản phẩm ID = 10
        ResponseEntity<ProductVariantRespone> response = productController.createVariant(10, request);

        // Assert (Kiểm tra kết quả): Trả về Http 200 và dữ liệu biến thể mới tạo
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productVariantService).createVariant(10, request);
    }

    @Test
    @DisplayName("Cập nhật thông tin biến thể")
    void updateVariant_shouldUpdateVariant() {
        // Arrange (Chuẩn bị dữ liệu): Payload cập nhật biến thể ID = 5
        CreateVariantRequest request = new CreateVariantRequest();
        ProductVariantRespone responseData = new ProductVariantRespone();
        when(productVariantService.updateVariant(5, request)).thenReturn(responseData);

        // Act (Thực thi): Gọi endpoint cập nhật
        ResponseEntity<ProductVariantRespone> response = productController.updateVariant(5, request);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productVariantService).updateVariant(5, request);
    }

    @Test
    @DisplayName("Đổi trạng thái của biến thể")
    void toggleVariantStatus_shouldToggleStatus() {
        // Act (Thực thi)
        ResponseEntity<String> response = productController.toggleVariantStatus(5);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Đã thay đổi trạng thái biến thể", response.getBody());
        verify(productVariantService).toggleVariantStatus(5);
    }

    @Test
    @DisplayName("Xóa biến thể")
    void deleteVariant_shouldDeleteVariant() {
        // Act (Thực thi)
        ResponseEntity<String> response = productController.deleteVariant(5);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Đã xóa biến thể", response.getBody());
        verify(productVariantService).deleteVariant(5);
    }

    @Test
    @DisplayName("Tạo SKU tự động")
    void generateSku_shouldReturnGeneratedSku() {
        // Arrange (Chuẩn bị dữ liệu): Giả lập logic sinh SKU từ ID sản phẩm và thuộc tính
        when(productVariantService.generateSku(10, 5)).thenReturn("SKU-10-5");

        // Act (Thực thi): Gọi endpoint
        ResponseEntity<Map<String, String>> response = productController.generateSku(10, 5);

        // Assert (Kiểm tra kết quả): Nhận được Http 200 và chuỗi SKU
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Map.of("sku", "SKU-10-5"), response.getBody());
        verify(productVariantService).generateSku(10, 5);
    }

    @Test
    @DisplayName("Tạo Barcode nội bộ tự động")
    void generateBarcode_shouldReturnGeneratedBarcode() {
        // Arrange (Chuẩn bị dữ liệu)
        when(productVariantService.generateInternalBarcode(10)).thenReturn("BARCODE-10");

        // Act (Thực thi)
        ResponseEntity<Map<String, String>> response = productController.generateBarcode(10);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Map.of("barcode", "BARCODE-10"), response.getBody());
        verify(productVariantService).generateInternalBarcode(10);
    }

    // ==========================================
    // =========== CONVERSION ENDPOINTS =========
    // ==========================================

    @Test
    @DisplayName("Lấy danh sách quy đổi đơn vị theo biến thể")
    void getConversionsByVariantId_shouldReturnConversions() {
        // Arrange (Chuẩn bị dữ liệu): Tạo 1 quy đổi giả lập
        UnitConversionResponse conversion = new UnitConversionResponse();
        List<UnitConversionResponse> conversions = List.of(conversion);
        when(unitConversionService.getConversionsByVariantId(5)).thenReturn(conversions);

        // Act (Thực thi): Gọi endpoint
        ResponseEntity<List<UnitConversionResponse>> response = productController.getConversionsByVariantId(5);

        // Assert (Kiểm tra kết quả): Đảm bảo mã 200 OK và dữ liệu trả về như mock
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(conversions, response.getBody());
        verify(unitConversionService).getConversionsByVariantId(5);
    }

    @Test
    @DisplayName("Thêm quy đổi đơn vị")
    void addConversion_shouldAddConversion() {
        // Arrange (Chuẩn bị dữ liệu)
        UnitConversionRequest request = new UnitConversionRequest();
        UnitConversionResponse responseData = new UnitConversionResponse();
        when(unitConversionService.addConversion(5, request)).thenReturn(responseData);

        // Act (Thực thi)
        ResponseEntity<UnitConversionResponse> response = productController.addConversion(5, request);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(unitConversionService).addConversion(5, request);
    }

    @Test
    @DisplayName("Cập nhật quy đổi đơn vị")
    void updateConversion_shouldUpdateConversion() {
        // Arrange (Chuẩn bị dữ liệu)
        UnitConversionRequest request = new UnitConversionRequest();
        UnitConversionResponse responseData = new UnitConversionResponse();
        when(unitConversionService.updateConversion(3, request)).thenReturn(responseData);

        // Act (Thực thi)
        ResponseEntity<UnitConversionResponse> response = productController.updateConversion(3, request);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(unitConversionService).updateConversion(3, request);
    }

    @Test
    @DisplayName("Xóa quy đổi đơn vị")
    void deleteConversion_shouldDeleteConversion() {
        // Act (Thực thi)
        ResponseEntity<String> response = productController.deleteConversion(3);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Đã xóa quy đổi đơn vị", response.getBody());
        verify(unitConversionService).deleteConversion(3);
    }

    // ==========================================
    // =============== UNIT ENDPOINTS ===========
    // ==========================================

    @Test
    @DisplayName("Lấy danh sách đơn vị tính")
    void getAllUnits_shouldReturnAllUnits() {
        // Arrange (Chuẩn bị dữ liệu)
        UnitResponse unit = new UnitResponse();
        List<UnitResponse> units = List.of(unit);
        when(unitService.getAllUnits()).thenReturn(units);

        // Act (Thực thi)
        ResponseEntity<List<UnitResponse>> response = productController.getAllUnits();

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(units, response.getBody());
        verify(unitService).getAllUnits();
    }

    @Test
    @DisplayName("Tạo đơn vị tính mới")
    void createUnit_shouldCreateUnit() {
        // Arrange (Chuẩn bị dữ liệu)
        UnitRequest request = new UnitRequest();
        UnitResponse responseData = new UnitResponse();
        when(unitService.createUnit(request)).thenReturn(responseData);

        // Act (Thực thi)
        ResponseEntity<UnitResponse> response = productController.createUnit(request);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(unitService).createUnit(request);
    }

    @Test
    @DisplayName("Cập nhật đơn vị tính")
    void updateUnit_shouldUpdateUnit() {
        // Arrange (Chuẩn bị dữ liệu)
        UnitRequest request = new UnitRequest();
        UnitResponse responseData = new UnitResponse();
        when(unitService.updateUnit(2, request)).thenReturn(responseData);

        // Act (Thực thi)
        ResponseEntity<UnitResponse> response = productController.updateUnit(2, request);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(unitService).updateUnit(2, request);
    }

    @Test
    @DisplayName("Xóa đơn vị tính")
    void deleteUnit_shouldDeleteUnit() {
        // Act (Thực thi)
        ResponseEntity<String> response = productController.deleteUnit(2);

        // Assert (Kiểm tra kết quả)
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Đã xóa đơn vị tính", response.getBody());
        verify(unitService).deleteUnit(2);
    }
}
