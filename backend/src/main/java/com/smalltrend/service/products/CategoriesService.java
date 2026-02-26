package com.smalltrend.service.products;

import com.smalltrend.entity.Category;
import java.util.List;

public interface CategoriesService {

    Category create(Category category);

    List<Category> getAll();

    Category getById(Integer id);

    Category update(Integer id, Category category);

    void delete(Integer id);
}