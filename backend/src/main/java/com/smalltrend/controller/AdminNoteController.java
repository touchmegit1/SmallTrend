package com.smalltrend.controller;

import com.smalltrend.dto.AdminNoteRequest;
import com.smalltrend.dto.AdminNoteResponse;
import com.smalltrend.entity.NoteStatus;
import com.smalltrend.entity.NoteTag;
import com.smalltrend.service.AdminNoteService;
import com.smalltrend.service.UserService;
import com.smalltrend.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminNoteController {

    private final AdminNoteService adminNoteService;
    private final UserService userService;

    private Integer getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getCurrentUser(username);
        return user.getId();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AdminNoteResponse>> getAllNotes(
            @RequestParam(required = false) NoteTag tag,
            @RequestParam(required = false) NoteStatus status) {
        
        return ResponseEntity.ok(adminNoteService.getAllNotes(tag, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AdminNoteResponse> getNoteById(@PathVariable Long id) {
        return ResponseEntity.ok(adminNoteService.getNoteById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AdminNoteResponse> createNote(@RequestBody AdminNoteRequest request) {
        Integer currentUserId = getCurrentUserId();
        return new ResponseEntity<>(adminNoteService.createNote(request, currentUserId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AdminNoteResponse> updateNote(
            @PathVariable Long id, 
            @RequestBody AdminNoteRequest request) {
        
        Integer currentUserId = getCurrentUserId();
        return ResponseEntity.ok(adminNoteService.updateNote(id, request, currentUserId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        Integer currentUserId = getCurrentUserId();
        adminNoteService.deleteNote(id, currentUserId);
        return ResponseEntity.noContent().build();
    }
}
