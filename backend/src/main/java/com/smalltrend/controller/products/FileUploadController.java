package com.smalltrend.controller.products;

import com.smalltrend.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    private final CloudinaryService cloudinaryService;

    public FileUploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/image")
    public ResponseEntity<Map<String, ?>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            logger.info("Starting image upload to Cloudinary: {}", file.getOriginalFilename());

            String targetFolder = (folder == null || folder.isBlank()) ? "user-avatars" : folder.trim();
            Map<String, Object> uploadResult = cloudinaryService.uploadFile(file, targetFolder);

            String imageUrl = (String) uploadResult.get("secure_url");
            logger.info("Image uploaded successfully to Cloudinary: {}", imageUrl);

            return ResponseEntity.ok(Map.of(
                    "url", imageUrl,
                    "publicId", uploadResult.get("public_id"),
                    "cloudinaryId", uploadResult.get("public_id")));

        } catch (Exception e) {
            logger.error("Error uploading image to Cloudinary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Upload to Cloudinary failed: " + e.getMessage()));
        }
    }
}
