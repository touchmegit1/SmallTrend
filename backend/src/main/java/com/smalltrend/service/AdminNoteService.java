package com.smalltrend.service;

import com.smalltrend.dto.AdminNoteRequest;
import com.smalltrend.dto.AdminNoteResponse;
import com.smalltrend.entity.NoteStatus;
import com.smalltrend.entity.NoteTag;

import java.util.List;

public interface AdminNoteService {
    List<AdminNoteResponse> getAllNotes(NoteTag tag, NoteStatus status);
    AdminNoteResponse getNoteById(Long id);
    AdminNoteResponse createNote(AdminNoteRequest request, Integer authorId);
    AdminNoteResponse updateNote(Long id, AdminNoteRequest request, Integer editorId);
    void deleteNote(Long id, Integer deleterId);
}
