package com.smalltrend.service.products;

import com.smalltrend.entity.Brand;
import com.smalltrend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final com.smalltrend.repository.ProductRepository productRepository;

    @Override
    public Brand create(Brand brand) {
        return brandRepository.save(brand);
    }

    @Override
    public List<Brand> getAll() {
        return brandRepository.findAll();
    }

    @Override
    public Brand getById(Integer id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
    }

    @Override
    public Brand update(Integer id, Brand brand) {
        Brand existing = getById(id);
        existing.setName(brand.getName());
        existing.setCountry(brand.getCountry());
        existing.setDescription(brand.getDescription());
        return brandRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        if (productRepository.existsByBrandId(id)) {
            throw new RuntimeException("Không thể xoá thương hiệu vì đang có sản phẩm thuộc thương hiệu này");
        }
        brandRepository.deleteById(id);
    }
}
