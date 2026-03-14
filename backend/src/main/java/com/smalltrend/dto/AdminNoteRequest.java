package com.smalltrend.dto;

import com.smalltrend.entity.NoteStatus;
import com.smalltrend.entity.NoteTag;
import lombok.Data;

@Data
public class AdminNoteRequest {
    private String title;
    private String content;
    private NoteTag tag;
    private NoteStatus status;
}
