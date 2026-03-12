package com.smalltrend.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiPublicSettingsResponse {
    private String aiName;
    private String welcomeMessage;
    private Boolean aiEnabled;
    private List<String> quickPrompts;
}
