package com.smalltrend.repository;

import com.smalltrend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdAt >= :since")
    // Long countNewCustomers(@Param("since") LocalDateTime since);

    // Fallback: just count total for now as createdAt is missing
    @Query("SELECT COUNT(c) FROM Customer c")
    Long countTotalCustomers();
}
