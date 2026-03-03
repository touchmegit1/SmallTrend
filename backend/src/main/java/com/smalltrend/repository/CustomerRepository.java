package com.smalltrend.repository;

import com.smalltrend.entity.Customer;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByPhone(String phone);

    // Tìm kiếm phone sau khi đã strip spaces (dùng REPLACE trong SQL)
    @Query("SELECT c FROM Customer c WHERE REPLACE(c.phone, ' ', '') = :cleanPhone")
    Optional<Customer> findByPhoneIgnoreSpaces(@Param("cleanPhone") String cleanPhone);

    @Query("SELECT COUNT(c) FROM Customer c")
    Long countTotalCustomers();
}

