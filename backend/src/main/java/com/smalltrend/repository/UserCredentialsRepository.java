package com.smalltrend.repository;

import com.smalltrend.entity.UserCredentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCredentialsRepository extends JpaRepository<UserCredentials, Long> {

    Optional<UserCredentials> findByUsername(String username);

    Optional<UserCredentials> findByAccessToken(String accessToken);

    Optional<UserCredentials> findByRefreshToken(String refreshToken);

    void deleteByUsername(String username);
}
