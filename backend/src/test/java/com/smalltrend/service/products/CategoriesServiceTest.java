package com.smalltrend.service.products;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.entity.Category;
import com.smalltrend.mapper.CategoryMapper;
import com.smalltrend.repository.CategoryRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoriesServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CategoriesServiceImpl categoriesService;

    private Category testCategory;
    private CategoriesRequest request;
    private CategoriesResponse response;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(1);
        testCategory.setCode("CAT-01");
        testCategory.setName("Electronics");
        testCategory.setDescription("Electronic items");

        request = new CategoriesRequest();
        request.setCode("CAT-01");
        request.setName("Electronics");
        request.setDescription("Electronic items");

        response = new CategoriesResponse();
        response.setId(1);
        response.setCode("CAT-01");
        response.setName("Electronics");
        response.setDescription("Electronic items");
    }

    @Test
    void create_shouldReturnMappedResponse() {
        when(categoryMapper.toEntity(request)).thenReturn(testCategory);
        when(categoryRepository.save(testCategory)).thenReturn(testCategory);
        when(categoryMapper.toResponse(testCategory)).thenReturn(response);

        CategoriesResponse result = categoriesService.create(request);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Electronics", result.getName());
        verify(categoryMapper).toEntity(request);
        verify(categoryRepository).save(testCategory);
        verify(categoryMapper).toResponse(testCategory);
    }

    @Test
    void getAll_shouldReturnListOfMappedResponses() {
        List<Category> categories = List.of(testCategory);
        when(categoryRepository.findAll()).thenReturn(categories);
        when(categoryMapper.toResponse(testCategory)).thenReturn(response);

        List<CategoriesResponse> result = categoriesService.getAll();

        assertEquals(1, result.size());
        assertEquals("Electronics", result.get(0).getName());
        verify(categoryRepository).findAll();
        verify(categoryMapper).toResponse(testCategory);
    }

    @Test
    void update_shouldReturnUpdatedResponse_whenCategoryExists() {
        CategoriesRequest updateReq = new CategoriesRequest();
        updateReq.setCode("CAT-02");
        updateReq.setName("Computers");
        updateReq.setDescription("PC & Laptops");

        when(categoryRepository.findById(1)).thenReturn(Optional.of(testCategory));
        
        Category savedCategory = new Category();
        savedCategory.setId(1);
        savedCategory.setCode("CAT-02");
        savedCategory.setName("Computers");
        savedCategory.setDescription("PC & Laptops");

        CategoriesResponse updatedResp = new CategoriesResponse();
        updatedResp.setId(1);
        updatedResp.setCode("CAT-02");
        updatedResp.setName("Computers");
        
        when(categoryRepository.save(testCategory)).thenReturn(savedCategory);
        when(categoryMapper.toResponse(savedCategory)).thenReturn(updatedResp);

        CategoriesResponse result = categoriesService.update(1, updateReq);

        assertNotNull(result);
        assertEquals("Computers", result.getName());
        verify(categoryRepository).findById(1);
        verify(categoryRepository).save(testCategory);
    }

    @Test
    void update_shouldThrowException_whenCategoryDoesNotExist() {
        when(categoryRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> categoriesService.update(99, new CategoriesRequest()));

        assertEquals("Không tìm thấy danh mục (Category not found)", exception.getMessage());
        verify(categoryRepository).findById(99);
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void delete_shouldThrowException_whenCategoryHasProducts() {
        when(productRepository.existsByCategoryId(1)).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> categoriesService.delete(1));

        assertEquals("Không thể xoá danh mục vì đang có sản phẩm thuộc danh mục này", exception.getMessage());
        verify(productRepository).existsByCategoryId(1);
        verify(categoryRepository, never()).deleteById(any());
    }

    @Test
    void delete_shouldDeleteCategory_whenNoProductsLinked() {
        when(productRepository.existsByCategoryId(1)).thenReturn(false);

        categoriesService.delete(1);

        verify(productRepository).existsByCategoryId(1);
        verify(categoryRepository).deleteById(1);
    }
}
