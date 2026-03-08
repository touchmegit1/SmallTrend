package com.smalltrend.service.products;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.entity.Category;
import com.smalltrend.mapper.CategoryMapper;
import com.smalltrend.repository.CategoryRepository;
import com.smalltrend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Lớp cài đặt (Implementation) cho các nghiệp vụ quản lý Danh mục
 */
@Service
@RequiredArgsConstructor
public class CategoriesServiceImpl implements CategoriesService {

    private final CategoryRepository repository;
    private final CategoryMapper mapper;
    private final ProductRepository productRepository;

    /**
     * Map request thành Category Entity và lưu vào database
     */
    @Override
    public CategoriesResponse create(CategoriesRequest request) {
        Category category = mapper.toEntity(request);
        Category savedCategory = repository.save(category);
        return mapper.toResponse(savedCategory);
    }

    /**
     * Lấy tất cả danh mục và map sang Response DTO
     */
    @Override
    public List<CategoriesResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Tìm danh mục theo ID, cập nhật thông tin và lưu lại
     */
    @Override
    public CategoriesResponse update(Integer id, CategoriesRequest request) {
        // Kiểm tra xem danh mục có tồn tại không
        Category existingCategory = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục (Category not found)"));

        // Cập nhật các trường thông tin
        existingCategory.setCode(request.getCode());
        existingCategory.setName(request.getName());
        existingCategory.setDescription(request.getDescription());

        // Lưu vào database và trả về Response
        Category updatedCategory = repository.save(existingCategory);
        return mapper.toResponse(updatedCategory);
    }

    /**
     * Xoá danh mục. Có kiểm tra ràng buộc không được xoá nếu đang bao gồm sản phẩm.
     */
    @Override
    public void delete(Integer id) {
        // Kiểm tra xem có sản phẩm (Product) nào đang sử dụng Category này không
        if (productRepository.existsByCategoryId(id)) {
            // Ném ngoại lệ để dừng việc xoá, tránh lỗi khoá ngoại
            throw new RuntimeException("Không thể xoá danh mục vì đang có sản phẩm thuộc danh mục này");
        }

        repository.deleteById(id);
    }
}
