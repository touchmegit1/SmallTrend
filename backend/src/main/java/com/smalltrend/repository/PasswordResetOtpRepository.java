package com.smalltrend.repository;

import com.smalltrend.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Integer> {

    Optional<PasswordResetOtp> findTopByEmailAndOtpCodeAndUsedFalseOrderByCreatedAtDesc(String email, String otpCode);

    void deleteByEmail(String email);
}
