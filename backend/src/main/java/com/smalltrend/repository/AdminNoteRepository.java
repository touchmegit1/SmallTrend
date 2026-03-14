package com.smalltrend.repository;

import com.smalltrend.entity.AdminNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminNoteRepository extends JpaRepository<AdminNote, Long> {
    
    // We fetch all non-deleted notes, ordered by: Pinned first, then Status (OPEN -> IN_PROGRESS -> DONE natively if we use custom sorting, 
    // but JPA sorts enums by ordinal or String value. For robust custom sorting we usually do it in service or native query).
    // For now, let's just pull them all non-deleted and apply the complex manual sorting in the Service to ensure exact business logic.
    List<AdminNote> findByIsDeletedFalse();
}
