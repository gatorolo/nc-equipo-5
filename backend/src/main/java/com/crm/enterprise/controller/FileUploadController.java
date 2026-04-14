package com.crm.enterprise.controller;

import com.crm.enterprise.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.saveFile(file);
        // Construimos la URL pública para el frontend
        String fileUrl = "http://localhost:8080/uploads/avatars/" + fileName;
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }
}
