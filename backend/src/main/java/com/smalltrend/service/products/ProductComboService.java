package com.smalltrend.service.products;

import com.smalltrend.dto.products.CreateProductComboRequest;
import com.smalltrend.dto.products.ProductComboResponse;

import java.util.List;

public interface ProductComboService {
    List<ProductComboResponse> getAllCombos();

    ProductComboResponse getComboById(Integer id);

    ProductComboResponse createCombo(CreateProductComboRequest request);

    ProductComboResponse updateCombo(Integer id, CreateProductComboRequest request);

    void deleteCombo(Integer id);

    void toggleStatus(Integer id);
}
