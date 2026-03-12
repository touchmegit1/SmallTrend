package com.smalltrend.service.products;

import com.smalltrend.entity.Brand;
import com.smalltrend.repository.BrandRepository;
import com.smalltrend.repository.ProductRepository;
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
        // Arrange: Trả về brand khi tìm theo ID
        when(brandRepository.findById(1)).thenReturn(Optional.of(testBrand));

        // Act: Gọi hàm getById
        Brand result = brandService.getById(1);

        // Assert: Đảm bảo kết quả đúng
        assertNotNull(result);
        assertEquals(1, result.getId());
        verify(brandRepository).findById(1);
    }

    @Test
    void getById_shouldThrowException_whenNotFound() {
        // Arrange: Trả về empty khi không tìm thấy ID
        when(brandRepository.findById(99)).thenReturn(Optional.empty());

        // Act & Assert: Kiểm tra ngoại lệ được ném ra
        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.getById(99));

        assertEquals("Brand not found", exception.getMessage());
        verify(brandRepository).findById(99);
    }

    @Test
    void update_shouldReturnUpdatedBrand() {
        // Arrange: Chuẩn bị dữ liệu cập nhật và mock các hàm tương ứng
        Brand updateInfo = new Brand();
        updateInfo.setName("Sony Updated");
        updateInfo.setCountry("US");
        updateInfo.setDescription("New Desc");

        when(brandRepository.findById(1)).thenReturn(Optional.of(testBrand));
        
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
        verify(brandRepository).findById(1);
        verify(brandRepository).save(testBrand);
    }

    @Test
    void delete_shouldThrowException_whenBrandHasProducts() {
        // Arrange: Trả về true khi kiểm tra brand có sản phẩm
        when(productRepository.existsByBrandId(1)).thenReturn(true);

        // Act & Assert: Đảm bảo ném lỗi khi cố xóa
        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.delete(1));

        assertEquals("Không thể xoá thương hiệu vì đang có sản phẩm thuộc thương hiệu này", exception.getMessage());
        verify(productRepository).existsByBrandId(1);
        verify(brandRepository, never()).deleteById(any()); // Đảm bảo hàm xóa không bao giờ được gọi
    }

    @Test
    void delete_shouldDeleteBrand_whenBrandHasNoProducts() {
        // Arrange: Trả về false khi kiểm tra brand có sản phẩm
        when(productRepository.existsByBrandId(1)).thenReturn(false);

        // Act: Gọi hàm xóa
        brandService.delete(1);

        // Assert: Xác minh hàm deleteById được gọi
        verify(productRepository).existsByBrandId(1);
        verify(brandRepository).deleteById(1);
    }
}
