package com.smalltrend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
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