package com.smalltrend.service.products;

import com.smalltrend.dto.products.CategoriesResponse;
import com.smalltrend.dto.products.CategoriesRequest;

import java.util.List;

public interface CategoriesService {
    CategoriesResponse create(CategoriesRequest request);
    List<CategoriesResponse> getAll();
    CategoriesResponse update(Integer id, CategoriesRequest request);
    void delete(Integer id);
}