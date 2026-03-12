package com.smalltrend.controller.products;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.service.products.CategoriesService;
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
class CategoryControllerTest {

    @Mock
    private CategoriesService categoriesService;

    private CategoryController categoryController;

    @BeforeEach
    void setup() {
        categoryController = new CategoryController(categoriesService);
    }

    @Test
    void create_shouldReturnCreatedCategory() {
        // Arrange: Chuẩn bị dữ liệu request và response mock
        CategoriesRequest request = new CategoriesRequest();
        request.setName("Electronics");

        CategoriesResponse responseData = new CategoriesResponse();
        responseData.setId(1);
        responseData.setName("Electronics");

        when(categoriesService.create(request)).thenReturn(responseData);

        // Act: Gọi API tạo danh mục
        ResponseEntity<CategoriesResponse> response = categoryController.create(request);

        // Assert: Kiểm tra kết quả HTTP và body
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(categoriesService).create(request);
    }

    @Test
    void getAll_shouldReturnCategoryList() {
        // Arrange: Chuẩn bị danh sách mock
        CategoriesResponse cat = new CategoriesResponse();
        cat.setId(1);
        List<CategoriesResponse> categories = List.of(cat);

        when(categoriesService.getAll()).thenReturn(categories);

        // Act: Gọi API lấy tất cả danh mục
        ResponseEntity<List<CategoriesResponse>> response = categoryController.getAll();

        // Assert: Đảm bảo trả về đúng danh sách
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(categories, response.getBody());
        verify(categoriesService).getAll();
    }

    @Test
    void update_shouldReturnUpdatedCategory() {
        // Arrange: Chuẩn bị object request và response cho hàm test
        CategoriesRequest request = new CategoriesRequest();
        request.setName("Electronics Updated");

        CategoriesResponse responseData = new CategoriesResponse();
        responseData.setId(1);
        responseData.setName("Electronics Updated");

        when(categoriesService.update(1, request)).thenReturn(responseData);

        // Act: Gọi API cập nhật danh mục
        ResponseEntity<CategoriesResponse> response = categoryController.update(1, request);

        // Assert: Kiểm tra kết quả phản hồi
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseData, response.getBody());
        verify(categoriesService).update(1, request);
    }

    @Test
    void delete_shouldCallDeleteAndReturnOk() {
        // Act: Gọi API xóa danh mục
        ResponseEntity<Void> response = categoryController.delete(1);

        // Assert: Đảm bảo HTTP status 200 OK và service đã được gọi
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(categoriesService).delete(1);
    }
}
