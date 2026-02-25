package com.smalltrend.service.Module1;

import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.dto.Module1.ProductVariantRespone;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVarirantService {
    
    private final ProductVariantRepository productVariantRepository;
    
    public List<ProductVariantRespone> getAllProductVariants() {
        return productVariantRepository.findAll().stream()
            .map(variant -> {
                ProductVariantRespone response = new ProductVariantRespone();
                response.setSku(variant.getSku());
                response.setName(variant.getProduct().getName());
                response.setSellPrice(variant.getSellPrice());
                return response;
            })
            .toList();
    }
}