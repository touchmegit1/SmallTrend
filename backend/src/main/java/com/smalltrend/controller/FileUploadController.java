package com.smalltrend.controller;

import com.smalltrend.dto.FileUploadResponse;
import com.smalltrend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {
    
    private final CloudinaryService cloudinaryService;
    
    @PostMapping("/upload/product")
    public ResponseEntity<FileUploadResponse> uploadProductImage(@RequestParam MultipartFile file) {
        Map<String, Object> result = cloudinaryService.uploadFile(file, "products");
        return ResponseEntity.ok(new FileUploadResponse(
            (String) result.get("secure_url"),
            (String) result.get("public_id"),
            "Product image uploaded successfully"
        ));
    }
    
    @PostMapping("/upload/promotion")
    public ResponseEntity<FileUploadResponse> uploadPromotionImage(@RequestParam MultipartFile file) {
        Map<String, Object> result = cloudinaryService.uploadFile(file, "promotions");
        return ResponseEntity.ok(new FileUploadResponse(
            (String) result.get("secure_url"),
            (String) result.get("public_id"),
            "Promotion image uploaded successfully"
        ));
    }
    
    @DeleteMapping("/delete/{publicId}")
    public ResponseEntity<String> deleteFile(@PathVariable String publicId) {
        cloudinaryService.deleteFile(publicId);
        return ResponseEntity.ok("File deleted successfully");
    }
}