package com.smalltrend.service.products;

import com.smalltrend.dto.products.CategoriesRequest;
import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.entity.Category;
import com.smalltrend.mapper.CategoryMapper;
import com.smalltrend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriesServiceImpl implements CategoriesService {

    private final CategoryRepository repository;
    private final CategoryMapper mapper;

    @Override
    public CategoriesResponse create(CategoriesRequest request) {
        Category category = mapper.toEntity(request);
        return mapper.toResponse(repository.save(category));
    }

    @Override
    public List<CategoriesResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public CategoriesResponse update(Integer id, CategoriesRequest request) {

        Category existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existing.setCode(request.getCode());
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());

        return mapper.toResponse(repository.save(existing));
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }
}
