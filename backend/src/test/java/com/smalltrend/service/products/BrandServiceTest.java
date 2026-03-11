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
        when(brandRepository.save(testBrand)).thenReturn(testBrand);

        Brand result = brandService.create(testBrand);

        assertNotNull(result);
        assertEquals("Sony", result.getName());
        verify(brandRepository).save(testBrand);
    }

    @Test
    void getAll_shouldReturnListOfBrands() {
        List<Brand> brands = List.of(testBrand);
        when(brandRepository.findAll()).thenReturn(brands);

        List<Brand> result = brandService.getAll();

        assertEquals(1, result.size());
        assertEquals("Sony", result.get(0).getName());
        verify(brandRepository).findAll();
    }

    @Test
    void getById_shouldReturnBrand_whenFound() {
        when(brandRepository.findById(1)).thenReturn(Optional.of(testBrand));

        Brand result = brandService.getById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        verify(brandRepository).findById(1);
    }

    @Test
    void getById_shouldThrowException_whenNotFound() {
        when(brandRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.getById(99));

        assertEquals("Brand not found", exception.getMessage());
        verify(brandRepository).findById(99);
    }

    @Test
    void update_shouldReturnUpdatedBrand() {
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

        Brand result = brandService.update(1, updateInfo);

        assertNotNull(result);
        assertEquals("Sony Updated", result.getName());
        verify(brandRepository).findById(1);
        verify(brandRepository).save(testBrand);
    }

    @Test
    void delete_shouldThrowException_whenBrandHasProducts() {
        when(productRepository.existsByBrandId(1)).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> brandService.delete(1));

        assertEquals("Không thể xoá thương hiệu vì đang có sản phẩm thuộc thương hiệu này", exception.getMessage());
        verify(productRepository).existsByBrandId(1);
        verify(brandRepository, never()).deleteById(any());
    }

    @Test
    void delete_shouldDeleteBrand_whenBrandHasNoProducts() {
        when(productRepository.existsByBrandId(1)).thenReturn(false);

        brandService.delete(1);

        verify(productRepository).existsByBrandId(1);
        verify(brandRepository).deleteById(1);
    }
}
