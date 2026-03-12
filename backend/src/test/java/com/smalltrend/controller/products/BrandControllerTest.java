package com.smalltrend.controller.products;

import com.smalltrend.entity.Brand;
import com.smalltrend.service.products.BrandService;
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
class BrandControllerTest {

    @Mock
    private BrandService brandService;

    private BrandController brandController;

    @BeforeEach
    void setup() {
        brandController = new BrandController(brandService);
    }

    @Test
    void create_shouldReturnCreatedBrand() {
        // Arrange: Chuẩn bị dữ liệu đầu vào và kết quả mock
        Brand brand = new Brand();
        brand.setName("Sony");
        Brand created = new Brand();
        created.setId(1);
        created.setName("Sony");

        when(brandService.create(brand)).thenReturn(created);

        // Act: Gọi API tạo brand
        ResponseEntity<Brand> response = brandController.create(brand);

        // Assert: Kiểm tra mã trạng thái và dữ liệu trả về
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(created, response.getBody());
        verify(brandService).create(brand);
    }

    @Test
    void getAll_shouldReturnBrandList() {
        // Arrange: Tạo danh sách mock
        Brand brand = new Brand();
        brand.setId(1);
        List<Brand> brands = List.of(brand);

        when(brandService.getAll()).thenReturn(brands);

        // Act: Gọi API lấy tất cả brand
        ResponseEntity<List<Brand>> response = brandController.getAll();

        // Assert: Kiểm tra kết quả
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(brands, response.getBody());
        verify(brandService).getAll();
    }

    @Test
    void getById_shouldReturnBrand() {
        // Arrange: Dữ liệu mock
        Brand brand = new Brand();
        brand.setId(5);

        when(brandService.getById(5)).thenReturn(brand);

        // Act: Gọi API lấy theo ID
        ResponseEntity<Brand> response = brandController.getById(5);

        // Assert: Kiểm tra kết quả
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(brand, response.getBody());
        verify(brandService).getById(5);
    }

    @Test
    void update_shouldReturnUpdatedBrand() {
        // Arrange: Dữ liệu mock cho update
        Brand updatedData = new Brand();
        updatedData.setName("Sony Updated");

        Brand updatedResponse = new Brand();
        updatedResponse.setId(5);
        updatedResponse.setName("Sony Updated");

        when(brandService.update(5, updatedData)).thenReturn(updatedResponse);

        // Act: Gọi API cập nhật
        ResponseEntity<Brand> response = brandController.update(5, updatedData);

        // Assert: Kiểm tra kết quả
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(updatedResponse, response.getBody());
        verify(brandService).update(5, updatedData);
    }

    @Test
    void delete_shouldCallDeleteAndReturnOk() {
        // Act: Gọi API xóa
        ResponseEntity<String> response = brandController.delete(10);

        // Assert: Kiểm tra mã phản hồi
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Brand deactivated", response.getBody());
        verify(brandService).delete(10);
    }
}
