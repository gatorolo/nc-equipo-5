package com.crm.enterprise.controller;

import com.crm.enterprise.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/email")
    public ResponseEntity<Map<String, String>> sendEmail(@RequestBody Map<String, String> payload) {
        notificationService.sendEmail(
                payload.get("to"),
                payload.get("subject"),
                payload.get("body")
        );
        return ResponseEntity.ok(Map.of("success", "true", "message", "Petición SMTP procesada"));
    }

    @PostMapping("/whatsapp")
    public ResponseEntity<Map<String, String>> sendWhatsApp(@RequestBody Map<String, String> payload) {
        notificationService.sendWhatsApp(
                payload.get("phone"),
                payload.get("message")
        );
        return ResponseEntity.ok(Map.of("success", "true", "message", "WhatsApp añadido a cola de envíos"));
    }

    @GetMapping
    public ResponseEntity<java.util.List<com.crm.enterprise.entity.Notification>> getAll() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAll() {
        notificationService.clearAll();
        return ResponseEntity.ok().build();
    }
}
