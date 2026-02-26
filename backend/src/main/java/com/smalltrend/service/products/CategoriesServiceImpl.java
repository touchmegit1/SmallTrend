package com.smalltrend.service.products;

import com.smalltrend.entity.Category;
import com.smalltrend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriesServiceImpl implements CategoriesService {

    private final CategoryRepository categoryRepository;

    @Override
    public Category create(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    @Override
    public Category getById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @Override
    public Category update(Integer id, Category category) {
        Category existing = getById(id);
        existing.setName(category.getName());
        return categoryRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        categoryRepository.deleteById(id);
    }
}