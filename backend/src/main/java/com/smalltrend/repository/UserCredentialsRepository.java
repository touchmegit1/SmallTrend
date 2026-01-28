package com.smalltrend.repository;

import com.smalltrend.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCredentialsRepository extends JpaRepository<UserCredential, Integer> {

    Optional<UserCredential> findByUsername(String username);

    Optional<UserCredential> findByUserId(Integer userId);
}
