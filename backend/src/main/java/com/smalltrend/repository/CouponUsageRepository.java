package com.smalltrend.repository;

import com.smalltrend.entity.CouponUsage;
import com.smalltrend.entity.Coupon;
import com.smalltrend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Integer> {
    int countByCouponAndCustomerAndStatusIn(Coupon coupon, Customer customer, List<String> statuses);
}
