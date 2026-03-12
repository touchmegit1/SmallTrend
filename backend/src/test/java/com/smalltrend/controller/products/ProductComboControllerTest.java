package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CreateProductComboRequest;
import com.smalltrend.dto.products.ProductComboResponse;
import com.smalltrend.service.products.ProductComboService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductComboControllerTest {

    @Mock
    private ProductComboService productComboService;

    private ProductComboController productComboController;

    @BeforeEach
    void setup() {
        productComboController = new ProductComboController(productComboService);
    }

    @Test
    void getAll_shouldReturnComboList() {
        // Arrange: Mock dữ liệu combo
        ProductComboResponse combo = new ProductComboResponse();
        combo.setId(1);
        List<ProductComboResponse> combos = List.of(combo);

        when(productComboService.getAllCombos()).thenReturn(combos);

        // Act: Lấy danh sách Combo
        ResponseEntity<List<ProductComboResponse>> response = productComboController.getAll();

        // Assert: Trả về trạng thái 200 và nội dung mong muốn
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(combos, response.getBody());
        verify(productComboService).getAllCombos();
    }

    @Test
    void getById_shouldReturnCombo() {
        // Arrange: Mock dữ liệu cho 1 combo theo ID
        ProductComboResponse combo = new ProductComboResponse();
        combo.setId(1);

        when(productComboService.getComboById(1)).thenReturn(combo);

        // Act: Lấy combo theo ID
        ResponseEntity<ProductComboResponse> response = productComboController.getById(1);

        // Assert: Xác minh dữ liệu
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(combo, response.getBody());
        verify(productComboService).getComboById(1);
    }

    @Test
    void create_shouldReturnCreatedCombo() {
        // Arrange: Chuẩn bị request tao moi combo
        CreateProductComboRequest request = new CreateProductComboRequest();
        ProductComboResponse responseData = new ProductComboResponse();
        responseData.setId(1);

        when(productComboService.createCombo(request)).thenReturn(responseData);

        // Act: Gọi API tạo combo
        ResponseEntity<ProductComboResponse> response = productComboController.create(request);

        // Assert: Trả về Combo vừa tạo
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productComboService).createCombo(request);
    }

    @Test
    void update_shouldReturnUpdatedCombo() {
        // Arrange: Chuẩn bị request update
        CreateProductComboRequest request = new CreateProductComboRequest();
        ProductComboResponse responseData = new ProductComboResponse();
        responseData.setId(1);

        when(productComboService.updateCombo(1, request)).thenReturn(responseData);

        // Act: Gọi API cập nhật
        ResponseEntity<ProductComboResponse> response = productComboController.update(1, request);

        // Assert: Trả về thông tin đã cập nhật thành công
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(productComboService).updateCombo(1, request);
    }

    @Test
    void toggleStatus_shouldReturnSuccessMessage() {
        // Act: Đổi trạng thái combo 
        ResponseEntity<String> response = productComboController.toggleStatus(1);

        // Assert: Phải thành công và đúng message
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Combo status toggled", response.getBody());
        verify(productComboService).toggleStatus(1);
    }

    @Test
    void delete_shouldReturnSuccessMessage() {
        // Act: API xóa combo
        ResponseEntity<String> response = productComboController.delete(1);

        // Assert: Phản hồi ok 
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Combo deleted successfully", response.getBody());
        verify(productComboService).deleteCombo(1);
    }
}
