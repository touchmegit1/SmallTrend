package com.smalltrend.repository;

import com.smalltrend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    List<Coupon> findAllByOrderByCreatedAtDesc();
    List<Coupon> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByCouponCode(String couponCode);
    Optional<Coupon> findByCouponCode(String couponCode);
}
