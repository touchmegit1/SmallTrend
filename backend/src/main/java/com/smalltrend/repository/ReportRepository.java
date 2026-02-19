package com.smalltrend.repository;

import com.smalltrend.entity.Report;
import com.smalltrend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Integer> {
    Page<Report> findByCreatedBy(User createdBy, Pageable pageable);
    List<Report> findByStatus(String status);
    Page<Report> findByCreatedByAndStatus(User createdBy, String status, Pageable pageable);
}
