package com.smalltrend.repository;

import com.smalltrend.entity.RolePermission;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
}
