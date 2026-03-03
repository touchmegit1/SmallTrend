package com.smalltrend.service.products;

import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.ProductResponse;
import java.util.List;

public interface ProductService {
    List<ProductResponse> getAll();

    ProductResponse getById(Integer id);

    ProductResponse create(CreateProductRequest request);

    ProductResponse update(Integer id, CreateProductRequest request);

    void delete(Integer id);

    void toggleStatus(Integer id);
}
