package com.smalltrend.dto.common;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class MessageResponse {

    private String code;
    private String message;

    public MessageResponse(String message) {
        this.code = null;
        this.message = message;
    }

    public MessageResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
