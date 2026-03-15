package com.smalltrend.service;

import com.smalltrend.dto.AdminNoteRequest;
import com.smalltrend.dto.AdminNoteResponse;
import com.smalltrend.entity.AdminNote;
import com.smalltrend.entity.NoteStatus;
import com.smalltrend.entity.NoteTag;
import com.smalltrend.entity.User;
import com.smalltrend.exception.ResourceNotFoundException;
import com.smalltrend.repository.AdminNoteRepository;
import com.smalltrend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminNoteServiceImpl implements AdminNoteService {

    private final AdminNoteRepository adminNoteRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<AdminNoteResponse> getAllNotes(NoteTag tag, NoteStatus status) {
        List<AdminNote> notes = adminNoteRepository.findByIsDeletedFalse();

        if (tag != null) {
            notes = notes.stream().filter(n -> n.getTag() == tag).collect(Collectors.toList());
        }
        if (status != null) {
            notes = notes.stream().filter(n -> n.getStatus() == status).collect(Collectors.toList());
        }

        return notes.stream()
                .sorted(noteComparator())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminNoteResponse getNoteById(Long id) {
        AdminNote note = getAdminNoteById(id);
        return mapToResponse(note);
    }

    @Override
    @Transactional
    public AdminNoteResponse createNote(AdminNoteRequest request, Integer authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AdminNote note = AdminNote.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .tag(request.getTag() != null ? request.getTag() : NoteTag.GENERAL)
                .status(request.getStatus() != null ? request.getStatus() : NoteStatus.OPEN)
                .isDeleted(false)
                .createdBy(author)
                .build();

        note = adminNoteRepository.save(note);
        
        auditLogService.logAction(
                author,
                "CREATE_ADMIN_NOTE",
                "AdminNote",
                note.getId().intValue(),
                "OK",
                "SYSTEM",
                null,
                "Created admin note: " + note.getTitle()
        );

        return mapToResponse(note);
    }

    @Override
    @Transactional
    public AdminNoteResponse updateNote(Long id, AdminNoteRequest request, Integer editorId) {
        AdminNote note = getAdminNoteById(id);
        User editor = userRepository.findById(editorId)
                .orElseThrow(() -> new ResourceNotFoundException("Editor user not found"));

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setTag(request.getTag() != null ? request.getTag() : note.getTag());
        note.setStatus(request.getStatus() != null ? request.getStatus() : note.getStatus());
        note.setUpdatedBy(editor);

        note = adminNoteRepository.save(note);

        auditLogService.logAction(
                editor,
                "UPDATE_ADMIN_NOTE",
                "AdminNote",
                note.getId().intValue(),
                "OK",
                "SYSTEM",
                null,
                String.format("Updated admin note ID %d (%s)", note.getId(), note.getTitle())
        );

        return mapToResponse(note);
    }

    @Override
    @Transactional
    public void deleteNote(Long id, Integer deleterId) {
        AdminNote note = getAdminNoteById(id);
        
        note.setDeleted(true);
        User deleter = userRepository.findById(deleterId)
                .orElseThrow(() -> new ResourceNotFoundException("Deleter user not found"));
        note.setUpdatedBy(deleter);
        
        adminNoteRepository.save(note);

        auditLogService.logAction(
                 deleter,
                 "DELETE_ADMIN_NOTE",
                 "AdminNote",
                 note.getId().intValue(),
                 "OK",
                 "SYSTEM",
                 null,
                 String.format("Soft-deleted admin note ID %d (%s) originally by user ID %d", 
                         note.getId(), note.getTitle(), note.getCreatedBy().getId())
        );
    }

    private AdminNote getAdminNoteById(Long id) {
        return adminNoteRepository.findById(id)
                .filter(n -> !n.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("AdminNote not found with id: " + id));
    }

    private Comparator<AdminNote> noteComparator() {
        return (n1, n2) -> {
            int tagPriority1 = getTagPriority(n1.getTag());
            int tagPriority2 = getTagPriority(n2.getTag());
            if (tagPriority1 != tagPriority2) {
                return Integer.compare(tagPriority1, tagPriority2);
            }
            
            int statusPriority1 = getStatusPriority(n1.getStatus());
            int statusPriority2 = getStatusPriority(n2.getStatus());
            if (statusPriority1 != statusPriority2) {
                return Integer.compare(statusPriority1, statusPriority2);
            }

            int tagCompare = n1.getTag().name().compareTo(n2.getTag().name());
            if (tagCompare != 0) {
                return tagCompare;
            }

            LocalDateTime date1 = n1.getCreatedAt() != null ? n1.getCreatedAt() : LocalDateTime.MIN;
            LocalDateTime date2 = n2.getCreatedAt() != null ? n2.getCreatedAt() : LocalDateTime.MIN;
            return date2.compareTo(date1);
        };
    }

    private int getTagPriority(NoteTag tag) {
        if (tag == null) return 5;
        switch (tag) {
            case ANNOUNCEMENT: return 1;
            case POLICY_UPDATE: return 1;
            case MAINTENANCE: return 2;
            case EVENT: return 2;
            case SHIFT_HANDOFF: return 3;
            case RESTOCK: return 3;
            case CUSTOMER_ISSUE: return 3;
            case GENERAL: return 4;
            default: return 5;
        }
    }

    private int getStatusPriority(NoteStatus status) {
        if (status == null) return 3;
        switch (status) {
            case OPEN: return 1;
            case IN_PROGRESS: return 2;
            case DONE: return 3;
            default: return 4;
        }
    }

    private AdminNoteResponse mapToResponse(AdminNote note) {
        return AdminNoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .tag(note.getTag())
                .status(note.getStatus())
                .createdById(note.getCreatedBy() != null ? note.getCreatedBy().getId() : null)
                .createdByName(note.getCreatedBy() != null ? note.getCreatedBy().getFullName() : "Unknown")
                .updatedById(note.getUpdatedBy() != null ? note.getUpdatedBy().getId() : null)
                .updatedByName(note.getUpdatedBy() != null ? note.getUpdatedBy().getFullName() : null)
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
