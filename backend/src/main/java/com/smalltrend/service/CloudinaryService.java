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
                            "resource_type", "raw",    // required for PDF / XLSX / CSV
                            "type",          "upload", // force public delivery (overrides account default)
                            "use_filename",  false,
                            "overwrite",     true
                    ));

            String secureUrl = (String) result.get("secure_url");
            log.info("Report uploaded to Cloudinary: {}", secureUrl);
            return secureUrl;   // this URL is saved in the DB (download_url column)

        } catch (IOException e) {
            log.error("Cloudinary upload failed for: {}", fileName, e);
            throw new RuntimeException("Could not upload report to Cloudinary: " + fileName, e);
        }
    }

    /**
     * Generate a signed Cloudinary download URL valid for 1 hour.
     * This bypasses Cloudinary access restrictions (authenticated delivery, strict transformations, etc.).
     * Uses Cloudinary's standard HMAC-SHA256 URL signing algorithm.
     *
     * @param storedUrl the secure_url saved in the DB (e.g. https://res.cloudinary.com/...)
     * @return a signed URL the browser can use to download the file directly
     */
    public String generateSignedDownloadUrl(String storedUrl) {
        try {
            // Extract public_id from the stored Cloudinary URL.
            // URL pattern: https://res.cloudinary.com/{cloudName}/raw/upload/v{version}/{publicId}
            String cloudName = cloudinary.config.cloudName;
            String apiSecret = cloudinary.config.apiSecret;

            String marker = cloudName + "/raw/upload/";
            int idx = storedUrl.indexOf(marker);
            if (idx == -1) {
                log.warn("Cannot extract publicId from URL, falling back to original: {}", storedUrl);
                return storedUrl;
            }

            String afterMarker = storedUrl.substring(idx + marker.length());
            // Strip version prefix  (v1234567890/) if present — Cloudinary adds this on upload
            String publicId = afterMarker.replaceFirst("^v\\d+/", "");

            long expiresAt = System.currentTimeMillis() / 1000 + 3600; // 1 hour from now

            // Cloudinary signature algorithm (SHA-256):
            // to_sign = "expires_at=<ts>&public_id=<id>" + apiSecret
            // signature = hex(SHA256(to_sign)).substring(0, 8) encoded in URL-safe Base64
            // Actually Cloudinary uses: SHA256(params_sorted_by_name + api_secret), first 8 chars of hex
            String toSign = "expires_at=" + expiresAt + "&public_id=" + publicId + apiSecret;

            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(toSign.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            String signature = hexString.substring(0, 8); // Cloudinary uses first 8 chars

            // Reconstruct the signed URL: insert s--{sig}-- after the upload/ segment
            // Format: https://res.cloudinary.com/{cloud}/raw/upload/s--{sig}--/v{version}/{publicId}
            String baseUrl = storedUrl.substring(0, idx + marker.length());
            String versionAndPublicId = afterMarker; // still has v<version>/ prefix if present
            String signedUrl = baseUrl + "s--" + signature + "--/" + versionAndPublicId
                    + "?expires_at=" + expiresAt;

            log.info("Generated signed download URL for publicId: {}", publicId);
            return signedUrl;

        } catch (Exception e) {
            log.error("Failed to generate signed URL for: {}", storedUrl, e);
            return storedUrl; // fall back to original URL
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
