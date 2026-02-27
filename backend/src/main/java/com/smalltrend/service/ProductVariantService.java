package com.smalltrend.service;

import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.dto.pos.ProductVariantRespone;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantService {
    
    private final ProductVariantRepository productVariantRepository;
    private final InventoryStockRepository inventoryStockRepository;
    
    public List<ProductVariantRespone> getAllProductVariants(String search, String barcode) {
        List<ProductVariant> variants;
        
        if (barcode != null && !barcode.isEmpty()) {
            // Search by barcode
            variants = productVariantRepository.findAll().stream()
                .filter(v -> v.getBarcode() != null && v.getBarcode().contains(barcode))
                .collect(Collectors.toList());
        } else if (search != null && !search.isEmpty()) {
            // Search by name or SKU
            String searchLower = search.toLowerCase();
            variants = productVariantRepository.findAll().stream()
                .filter(v -> 
                    (v.getProduct().getName() != null && v.getProduct().getName().toLowerCase().contains(searchLower)) ||
                    (v.getSku() != null && v.getSku().toLowerCase().contains(searchLower)) ||
                    (v.getBarcode() != null && v.getBarcode().contains(search))
                )
                .collect(Collectors.toList());
        } else {
            // Get all products
            variants = productVariantRepository.findAll();
        }
        
        return variants.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ProductVariantRespone> getVariantsByProductId(Integer productId) {
        List<ProductVariant> variants = productVariantRepository.findAll().stream()
            .filter(v -> v.getProduct().getId().equals(productId))
            .collect(Collectors.toList());
        
        return variants.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    private ProductVariantRespone mapToResponse(ProductVariant variant) {
        ProductVariantRespone response = new ProductVariantRespone();
        response.setId(variant.getId());
        response.setSku(variant.getSku());
        response.setBarcode(variant.getBarcode());
        response.setName(variant.getProduct().getName());
        response.setSellPrice(variant.getSellPrice());
        response.setIsActive(variant.isActive());
        
        // Get stock quantity
        Integer stockQty = inventoryStockRepository.findByVariantId(variant.getId())
            .stream()
            .mapToInt(InventoryStock::getQuantity)
            .sum();
        response.setStockQuantity(stockQty);
        
        // Get category and brand names
        if (variant.getProduct().getCategory() != null) {
            response.setCategoryName(variant.getProduct().getCategory().getName());
        }
        if (variant.getProduct().getBrand() != null) {
            response.setBrandName(variant.getProduct().getBrand().getName());
        }
        
        return response;
    }
}
