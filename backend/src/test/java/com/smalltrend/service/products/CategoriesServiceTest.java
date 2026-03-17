package com.smalltrend.service.products;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.entity.Category;
import com.smalltrend.mapper.CategoryMapper;
import com.smalltrend.repository.CategoryRepository;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.validation.product.CategoryValidator;
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

    @Mock
    private CategoryValidator categoryValidator;

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
        // Arrange: Mock các hành vi chuyển đổi và lưu trữ
        when(categoryMapper.toEntity(request)).thenReturn(testCategory);
        when(categoryRepository.save(testCategory)).thenReturn(testCategory);
        when(categoryMapper.toResponse(testCategory)).thenReturn(response);

        // Act: Gọi hàm create
        CategoriesResponse result = categoriesService.create(request);

        // Assert: Kiểm tra dữ liệu trả về hợp lệ và các mock đã được gọi
        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("Electronics", result.getName());
        verify(categoryMapper).toEntity(request);
        verify(categoryRepository).save(testCategory);
        verify(categoryMapper).toResponse(testCategory);
    }

    @Test
    void getAll_shouldReturnListOfMappedResponses() {
        // Arrange: Mock dữ liệu lấy từ DB và chuyển đổi
        List<Category> categories = List.of(testCategory);
        when(categoryRepository.findAll()).thenReturn(categories);
        when(categoryMapper.toResponse(testCategory)).thenReturn(response);

        // Act: Gọi hàm getAll
        List<CategoriesResponse> result = categoriesService.getAll();

        // Assert: Đảm bảo danh sách trả đúng số lượng và nội dung
        assertEquals(1, result.size());
        assertEquals("Electronics", result.get(0).getName());
        verify(categoryRepository).findAll();
        verify(categoryMapper).toResponse(testCategory);
    }

    @Test
    void update_shouldReturnUpdatedResponse_whenCategoryExists() {
        // Arrange: Tạo request cập nhật và mock tìm kiếm, lưu trữ
        CategoriesRequest updateReq = new CategoriesRequest();
        updateReq.setCode("CAT-02");
        updateReq.setName("Computers");
        updateReq.setDescription("PC & Laptops");

        when(categoryValidator.requireExistingCategory(1)).thenReturn(testCategory);
        
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

        // Act: Cập nhật danh mục
        CategoriesResponse result = categoriesService.update(1, updateReq);

        // Assert: Đảm bảo dữ liệu mới được trả về chính xác
        assertNotNull(result);
        assertEquals("Computers", result.getName());
        verify(categoryValidator).requireExistingCategory(1);
        verify(categoryRepository).save(testCategory);
    }

    @Test
    void update_shouldThrowException_whenCategoryDoesNotExist() {
        // Arrange: Mock trả về empty khi không tìm thấy danh mục
        when(categoryValidator.requireExistingCategory(99)).thenThrow(new RuntimeException("Không tìm thấy danh mục"));

        // Act & Assert: Phải ném ra lỗi RuntimeException
        RuntimeException exception = assertThrows(RuntimeException.class, () -> categoriesService.update(99, new CategoriesRequest()));

        assertEquals("Không tìm thấy danh mục", exception.getMessage());
        verify(categoryValidator).requireExistingCategory(99);
        verify(categoryRepository, never()).save(any());
    }

    @Test
    void delete_shouldThrowException_whenCategoryHasProducts() {
        // Arrange: Mock danh mục đang chứa sản phẩm
        doThrow(new RuntimeException("Không thể xoá danh mục vì đang có sản phẩm thuộc danh mục này"))
            .when(categoryValidator).validateDeletable(1);

        // Act & Assert: Cố gắng xóa phải ném lỗi
        RuntimeException exception = assertThrows(RuntimeException.class, () -> categoriesService.delete(1));

        assertEquals("Không thể xoá danh mục vì đang có sản phẩm thuộc danh mục này", exception.getMessage());
        verify(categoryValidator).validateDeletable(1);
        verify(categoryRepository, never()).deleteById(any());
    }

    @Test
    void delete_shouldDeleteCategory_whenNoProductsLinked() {
        // Arrange: Mock danh mục rỗng (không chứa sản phẩm)
        // Act: Tiến hành xóa
        categoriesService.delete(1);

        // Assert: Đảm bảo lệnh xóa theo id được gọi
        verify(categoryValidator).validateDeletable(1);
        verify(categoryRepository).deleteById(1);
    }
}
