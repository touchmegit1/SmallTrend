package com.smalltrend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload a MultipartFile (e.g. images) to Cloudinary.
     * Uses resource_type=auto so Cloudinary detects the type.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadFile(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", "smalltrend/" + folder,
                    "resource_type", "auto"
                )
            );
            log.info("File uploaded successfully: {}", uploadResult.get("secure_url"));
            return uploadResult;
        } catch (IOException e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    /**
     * Upload raw byte[] content (PDF, XLSX, CSV) to Cloudinary.
     * Uses resource_type=raw so non-image files are accepted.
     *
     * @return the Cloudinary secure_url saved in the DB for direct downloads
     */
    @SuppressWarnings("unchecked")
    public String uploadFile(byte[] content, String folder, String fileName) {
        String publicId = "smalltrend/" + folder + "/" + UUID.randomUUID() + "_" + fileName;
        try {
            Map<String, Object> result = cloudinary.uploader().upload(content,
                    ObjectUtils.asMap(
                            "public_id",     publicId,
                            "resource_type", "raw",   // required for PDF / XLSX / CSV
                            "use_filename",  false,
                            "overwrite",     true
                    ));

            String secureUrl = (String) result.get("secure_url");
            log.info("Report uploaded to Cloudinary: {}", secureUrl);
            return secureUrl;   // this URL is saved in the DB (file_path / download_url)

        } catch (IOException e) {
            log.error("Cloudinary upload failed for: {}", fileName, e);
            throw new RuntimeException("Could not upload report to Cloudinary: " + fileName, e);
        }
    }

    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("File deleted successfully: {}", publicId);
        } catch (IOException e) {
            log.error("Error deleting file: {}", e.getMessage());
            throw new RuntimeException("File deletion failed: " + e.getMessage());
        }
    }
}
