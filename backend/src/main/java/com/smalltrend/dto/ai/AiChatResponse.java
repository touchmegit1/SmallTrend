package com.smalltrend.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {
    private String reply;
    private String sessionId;
    private String timestamp;
}
