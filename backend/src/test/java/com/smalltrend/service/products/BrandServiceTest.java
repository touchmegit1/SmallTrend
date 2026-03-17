package com.smalltrend.service.products;

import com.smalltrend.entity.Brand;
import com.smalltrend.repository.BrandRepository;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.validation.product.BrandValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BrandServiceTest {

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BrandValidator brandValidator;

    @InjectMocks
    private BrandServiceImpl brandService;

    private Brand testBrand;

    @BeforeEach
    void setUp() {
        testBrand = new Brand();
        testBrand.setId(1);
        testBrand.setName("Sony");
        testBrand.setCountry("Japan");
        testBrand.setDescription("Electronic brand");
    }

    @Test
    void create_shouldReturnSavedBrand() {
        // Arrange: Cài đặt mock repository trả về testBrand khi được gọi hàm save
        when(brandRepository.save(testBrand)).thenReturn(testBrand);

        // Act: Gọi hàm create của service
        Brand result = brandService.create(testBrand);

        // Assert: Kiểm tra kết quả
        assertNotNull(result);
        assertEquals("Sony", result.getName());
        verify(brandRepository).save(testBrand); // Xác minh hàm save đã được gọi
    }

    @Test
    void getAll_shouldReturnListOfBrands() {
        // Arrange: Chuẩn bị danh sách brand giả
        List<Brand> brands = List.of(testBrand);
        when(brandRepository.findAll()).thenReturn(brands);

        // Act: Gọi hàm getAll
        List<Brand> result = brandService.getAll();

        // Assert: Kiểm tra danh sách trả về
        assertEquals(1, result.size());
        assertEquals("Sony", result.get(0).getName());
        verify(brandRepository).findAll(); // Xác minh hàm findAll đã được gọi
    }

    @Test
    void getById_shouldReturnBrand_whenFound() {
        when(brandValidator.requireExistingBrand(1)).thenReturn(testBrand);

        // Act: Gọi hàm getById
        Brand result = brandService.getById(1);

        // Assert: Đảm bảo kết quả đúng
        assertNotNull(result);
        assertEquals(1, result.getId());
        verify(brandValidator).requireExistingBrand(1);
    }

    @Test
    void getById_shouldThrowException_whenNotFound() {
        when(brandValidator.requireExistingBrand(99)).thenThrow(new RuntimeException("Không tìm thấy thương hiệu"));

        // Act & Assert: Kiểm tra ngoại lệ được ném ra
        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.getById(99));

        assertEquals("Không tìm thấy thương hiệu", exception.getMessage());
        verify(brandValidator).requireExistingBrand(99);
    }

    @Test
    void update_shouldReturnUpdatedBrand() {
        // Arrange: Chuẩn bị dữ liệu cập nhật và mock các hàm tương ứng
        Brand updateInfo = new Brand();
        updateInfo.setName("Sony Updated");
        updateInfo.setCountry("US");
        updateInfo.setDescription("New Desc");

        when(brandValidator.requireExistingBrand(1)).thenReturn(testBrand);
        
        Brand updatedBrand = new Brand();
        updatedBrand.setId(1);
        updatedBrand.setName("Sony Updated");
        updatedBrand.setCountry("US");
        updatedBrand.setDescription("New Desc");
        
        when(brandRepository.save(testBrand)).thenReturn(updatedBrand);

        // Act: Gọi hàm update
        Brand result = brandService.update(1, updateInfo);

        // Assert: Kiểm tra dữ liệu sau cập nhật
        assertNotNull(result);
        assertEquals("Sony Updated", result.getName());
        verify(brandValidator).requireExistingBrand(1);
        verify(brandRepository).save(testBrand);
    }

    @Test
    void delete_shouldThrowException_whenBrandHasProducts() {
        doThrow(new RuntimeException("Không thể xoá thương hiệu vì đang có sản phẩm thuộc thương hiệu này"))
            .when(brandValidator).validateDeletable(1);

        // Act & Assert: Đảm bảo ném lỗi khi cố xóa
        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.delete(1));

        assertEquals("Không thể xoá thương hiệu vì đang có sản phẩm thuộc thương hiệu này", exception.getMessage());
        verify(brandValidator).validateDeletable(1);
        verify(brandRepository, never()).deleteById(any()); // Đảm bảo hàm xóa không bao giờ được gọi
    }

    @Test
    void delete_shouldDeleteBrand_whenBrandHasNoProducts() {
        // Act: Gọi hàm xóa
        brandService.delete(1);

        // Assert: Xác minh hàm deleteById được gọi
        verify(brandValidator).validateDeletable(1);
        verify(brandRepository).deleteById(1);
    }
}
