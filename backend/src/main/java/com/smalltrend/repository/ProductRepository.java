package com.smalltrend.repository;

import com.smalltrend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query("SELECT DISTINCT p FROM Product p " +
           "JOIN p.variants v " +
           "JOIN v.inventoryStocks s " +
           "WHERE s.quantity > 0")
    List<Product> findProductsWithStock();
    
    @Query("SELECT p FROM Product p " +
           "JOIN p.variants v " +
           "JOIN v.inventoryStocks s " +
           "GROUP BY p.id " +
           "HAVING SUM(s.quantity) <= 50")
    List<Product> findLowStockProducts();
}
