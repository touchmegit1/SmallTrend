package com.smalltrend.service.products;

import com.smalltrend.entity.Brand;
import java.util.List;

public interface BrandService {

    Brand create(Brand brand);

    List<Brand> getAll();

    Brand getById(Integer id);

    Brand update(Integer id, Brand brand);

    void delete(Integer id);
}