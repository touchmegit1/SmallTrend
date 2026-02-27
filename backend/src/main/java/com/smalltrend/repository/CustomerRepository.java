package com.smalltrend.repository;

import com.smalltrend.entity.Customer;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByPhone(String phone);
    
    @Query("SELECT c FROM Customer c WHERE REPLACE(c.phone, ' ', '') = REPLACE(:phone, ' ', '')")
    Optional<Customer> findByPhoneIgnoreSpaces(String phone);

    @Query("SELECT COUNT(c) FROM Customer c")
    Long countTotalCustomers();
}
