package com.smalltrend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Uploads report files to Cloudinary (cloud storage).
 * Returns the public secure_url so it can be stored in the DB and used for direct downloads.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final Cloudinary cloudinary;

    /**
     * Upload raw file bytes to Cloudinary.
     *
     * @param content          the file bytes to upload
     * @param originalFileName the original file name (used to derive a unique public_id)
     * @return the Cloudinary secure_url (e.g. https://res.cloudinary.com/…)
     */
    public String storeFile(byte[] content, String originalFileName) {
        // Build a unique public_id inside the "reports" folder
        String publicId = "reports/" + UUID.randomUUID() + "_" + originalFileName;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(content,
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "resource_type", "raw",   // required for non-image files (PDF, XLSX, CSV)
                            "use_filename", false,
                            "overwrite", true
                    ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Report uploaded to Cloudinary: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Failed to upload report to Cloudinary: {}", originalFileName, e);
            throw new RuntimeException("Could not upload report to cloud storage: " + originalFileName, e);
        }
    }
}
