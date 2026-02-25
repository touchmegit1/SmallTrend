package com.smalltrend.service.Products;


import com.smalltrend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import com.smalltrend.entity.CategoriesResponse;

@Service
@RequiredArgsConstructor
public class CategoriesService {
    private final CategoryRepository categoryRepository;

    public List<CategoriesResponse> getAll() {
        return categoryRepository.findAll();
    }

    public Optional<CategoriesResponse> findById(Integer id) {
        return categoryRepository.findById(id);
    }

}
