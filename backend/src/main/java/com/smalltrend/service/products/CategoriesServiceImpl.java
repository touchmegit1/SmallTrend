package com.smalltrend.service.products;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.entity.Category;
import com.smalltrend.mapper.CategoryMapper;
import com.smalltrend.repository.CategoryRepository;
import com.smalltrend.validation.product.CategoryValidator;
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
    private final CategoryValidator categoryValidator;

    /**
     * Map request thành Category Entity và lưu vào database
     */
    @Override
    public CategoriesResponse create(CategoriesRequest request) {
        categoryValidator.validateNameUniqueForCreate(request.getName());
        categoryValidator.validateCodeUniqueForCreate(request.getCode());
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
        Category existingCategory = categoryValidator.requireExistingCategory(id);
        categoryValidator.validateNameUniqueForUpdate(request.getName(), id);
        categoryValidator.validateCodeUniqueForUpdate(request.getCode(), id);

        existingCategory.setCode(request.getCode());
        existingCategory.setName(request.getName());
        existingCategory.setDescription(request.getDescription());

        Category updatedCategory = repository.save(existingCategory);
        return mapper.toResponse(updatedCategory);
    }

    /**
     * Xoá danh mục. Có kiểm tra ràng buộc không được xoá nếu đang bao gồm sản phẩm.
     */
    @Override
    public void delete(Integer id) {
        categoryValidator.validateDeletable(id);
        repository.deleteById(id);
    }
}
