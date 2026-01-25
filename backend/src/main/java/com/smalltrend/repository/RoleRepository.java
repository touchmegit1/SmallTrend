/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.smalltrend.repository;

import com.smalltrend.entity.Roles;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 *
 * @author Admin
 */
@Repository
public interface RoleRepository extends JpaRepository<Roles, Long> {

}
