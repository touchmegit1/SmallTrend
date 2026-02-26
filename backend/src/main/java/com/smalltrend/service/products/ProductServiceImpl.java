package com.smalltrend.service.products;

import com.smalltrend.entity.Product;
import com.smalltrend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    @Override
    public Product getById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Override
    public Product create(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product update(Integer id, Product product) {
        Product existing = getById(id);
        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setImageUrl(product.getImageUrl());
        existing.setBrand(product.getBrand());
        existing.setCategory(product.getCategory());
        existing.setTaxRate(product.getTaxRate());
        return productRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        productRepository.deleteById(id);
    }
}
