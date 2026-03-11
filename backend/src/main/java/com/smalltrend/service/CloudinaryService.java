package com.smalltrend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload a MultipartFile (e.g. images) to Cloudinary. Uses
     * resource_type=auto so Cloudinary detects the type.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadFile(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "smalltrend/" + folder,
                            "resource_type", "auto",
                            "type", "upload"
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
     * Upload raw byte[] content (PDF, XLSX, CSV) to Cloudinary. Uses
     * resource_type=raw so non-image files are accepted.
     *
     * @return the Cloudinary secure_url saved in the DB for direct downloads
     */
    @SuppressWarnings("unchecked")
    public String uploadFile(byte[] content, String folder, String fileName) {
        String publicId = "smalltrend/" + folder + "/" + UUID.randomUUID() + "_" + fileName;
        try {
            Map<String, Object> result = cloudinary.uploader().upload(content,
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "resource_type", "raw", // required for PDF / XLSX / CSV
                            "type", "upload", // force public delivery (overrides account default)
                            "use_filename", false,
                            "overwrite", true
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
     * Download file bytes via Cloudinary's private download API endpoint.
     * Endpoint: https://api.cloudinary.com/v1_1/{cloud}/raw/download Signature:
     * SHA-1 of sorted params string (excl. api_key, resource_type, signature) +
     * api_secret
     */
    public byte[] downloadFileBytes(String storedUrl) {
        try {
            String cloudName = cloudinary.config.cloudName;
            String apiKey = cloudinary.config.apiKey;
            String apiSecret = cloudinary.config.apiSecret;

            // Extract public_id from stored URL
            String marker = cloudName + "/raw/upload/";
            int idx = storedUrl.indexOf(marker);
            if (idx == -1) {
                throw new RuntimeException("Unrecognised Cloudinary URL: " + storedUrl);
            }
            String publicId = storedUrl.substring(idx + marker.length()).replaceFirst("^v\\d+/", "");

            // Extract filename from public_id for Content-Disposition / target_filename
            String targetFilename = publicId.contains("/") ? publicId.substring(publicId.lastIndexOf('/') + 1) : publicId;

            long timestamp = System.currentTimeMillis() / 1000;

            // Signature string: all params sorted alphabetically (excl. api_key, resource_type, signature)
            // Params: attachment, public_id, target_filename, timestamp, type
            String toSign = "attachment=true"
                    + "&public_id=" + publicId
                    + "&target_filename=" + targetFilename
                    + "&timestamp=" + timestamp
                    + "&type=upload"
                    + apiSecret;

            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(toSign.getBytes(StandardCharsets.UTF_8));
            StringBuilder sig = new StringBuilder();
            for (byte b : hash) {
                sig.append(String.format("%02x", b));
            }

            String downloadUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/raw/download"
                    + "?api_key=" + apiKey
                    + "&attachment=true"
                    + "&public_id=" + URLEncoder.encode(publicId, StandardCharsets.UTF_8)
                    + "&target_filename=" + URLEncoder.encode(targetFilename, StandardCharsets.UTF_8)
                    + "&timestamp=" + timestamp
                    + "&type=upload"
                    + "&signature=" + sig;

            log.info("Downloading via Cloudinary API for publicId: {}", publicId);

            HttpURLConnection conn = (HttpURLConnection) new URL(downloadUrl).openConnection();
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(60000);

            int status = conn.getResponseCode();
            if (status != 200) {
                throw new RuntimeException("Cloudinary API download returned HTTP " + status + " for: " + publicId);
            }

            try (InputStream is = conn.getInputStream()) {
                return is.readAllBytes();
            }

        } catch (Exception e) {
            log.error("Failed to download file bytes from Cloudinary: {}", storedUrl, e);
            throw new RuntimeException("Could not download report file", e);
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
