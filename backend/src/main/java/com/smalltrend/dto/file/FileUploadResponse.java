package com.smalltrend.dto.file;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileUploadResponse {

    private String url;
    private String publicId;
    private String message;
}
