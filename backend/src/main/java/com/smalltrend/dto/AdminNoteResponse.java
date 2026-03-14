package com.smalltrend.dto;

import com.smalltrend.entity.NoteStatus;
import com.smalltrend.entity.NoteTag;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminNoteResponse {
    private Long id;
    private String title;
    private String content;
    private NoteTag tag;
    private NoteStatus status;
    
    // Author & Editor info stripped down for UI
    private Integer createdById;
    private String createdByName;
    
    private Integer updatedById;
    private String updatedByName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
