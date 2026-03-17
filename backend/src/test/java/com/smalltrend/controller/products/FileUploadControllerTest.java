package com.smalltrend.controller.products;

import com.smalltrend.service.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileUploadControllerTest {

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private FileUploadController fileUploadController;

    private MockMultipartFile validFile;
    private MockMultipartFile emptyFile;

    @BeforeEach
    void setUp() {
        validFile = new MockMultipartFile(
                "file",
                "test-image.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );
    }

    @Test
    void uploadImage_withEmptyFile_shouldReturnBadRequest() {
        // Act: Gọi API tải lên nhưng cung cấp file rỗng
        ResponseEntity<Map<String, ?>> response = fileUploadController.uploadImage(emptyFile, null);

        // Assert: Yêu cầu trả về lỗi 400 Bad Request
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("File is empty", response.getBody().get("error"));
    }

    @Test
    void uploadImage_withValidFile_shouldReturnOkAndUrl() {
        // Arrange: Mock kết quả trả về từ Cloudinary khi tải lên thành công
        Map<String, Object> mockUploadResult = Map.of(
                "secure_url", "https://res.cloudinary.com/demo/image/upload/v123456/test-image.jpg",
                "public_id", "user-avatars/test-image-123"
        );

        when(cloudinaryService.uploadFile(validFile, "user-avatars")).thenReturn(mockUploadResult);

        // Act: Gọi API tải hình ảnh
        ResponseEntity<Map<String, ?>> response = fileUploadController.uploadImage(validFile, null);

        // Assert: Đảm bảo phản hồi 200 OK cùng với Url hình ảnh
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("https://res.cloudinary.com/demo/image/upload/v123456/test-image.jpg", response.getBody().get("url"));
        assertEquals("user-avatars/test-image-123", response.getBody().get("publicId"));
        assertEquals("user-avatars/test-image-123", response.getBody().get("cloudinaryId"));
    }

    @Test
    void uploadImage_whenCloudinaryThrowsException_shouldReturnInternalServerError() {
        // Arrange: Mock xảy ra lỗi từ phía Cloudinary
        when(cloudinaryService.uploadFile(any(), anyString()))
                .thenThrow(new RuntimeException("Cloudinary network error"));

        // Act: Gọi API tải hình ảnh
        ResponseEntity<Map<String, ?>> response = fileUploadController.uploadImage(validFile, null);

        // Assert: API phải bắt lỗi và trả về 500 Internal Server Error
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Upload to Cloudinary failed: Cloudinary network error", response.getBody().get("error"));
    }

    @Test
    void uploadImage_withCustomFolder_shouldUseProvidedFolder() {
        Map<String, Object> mockUploadResult = Map.of(
                "secure_url", "https://res.cloudinary.com/demo/image/upload/v123456/products/test-image.jpg",
                "public_id", "products/test-image-123"
        );

        when(cloudinaryService.uploadFile(validFile, "products")).thenReturn(mockUploadResult);

        ResponseEntity<Map<String, ?>> response = fileUploadController.uploadImage(validFile, "products");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("https://res.cloudinary.com/demo/image/upload/v123456/products/test-image.jpg", response.getBody().get("url"));
        assertEquals("products/test-image-123", response.getBody().get("publicId"));
    }
}
