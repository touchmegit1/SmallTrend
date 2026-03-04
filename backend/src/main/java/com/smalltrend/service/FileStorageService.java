package com.smalltrend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * @deprecated Use {@link CloudinaryService#uploadFile(byte[], String, String)} directly.
 * This class is kept only for backward compatibility and will be removed in a future cleanup.
 */
@Deprecated
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final CloudinaryService cloudinaryService;

    /** @deprecated Use CloudinaryService.uploadFile() instead. */
    @Deprecated
    public String storeFile(byte[] content, String originalFileName) {
        return cloudinaryService.uploadFile(content, "reports", originalFileName);
    }
}
