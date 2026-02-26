package com.smalltrend.service.products;

import com.smalltrend.entity.Product;
import java.util.List;

public interface ProductService {
    List<Product> getAll();
    Product getById(Integer id);
    Product create(Product product);
    Product update(Integer id, Product product);
    void delete(Integer id);
}
