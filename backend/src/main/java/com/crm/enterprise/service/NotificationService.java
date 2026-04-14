package com.crm.enterprise.service;

import com.crm.enterprise.entity.Notification;
import com.crm.enterprise.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Value("${spring.mail.username}")
    private String mailUsername;

    public void sendEmail(String to, String subject, String body) {
        log.info(">>>> INICIANDO ENVÍO SMTP: Destinatario={} <<<<", to);
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom(mailUsername);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);
            
            mailSender.send(mimeMessage);

            saveInternalNotification(subject, "Email enviado exitosamente a " + to, "success");
            log.info(">>>> ÉXITO TOTAL: Mensaje aceptado por Google <<<<");
        } catch (MessagingException e) {
            log.error(">>>> ERROR DE PROTOCOLO SMTP <<<<");
            e.printStackTrace(); // Crucial para ver el fallo en consola
            saveInternalNotification(subject, "Error SMTP: " + e.getMessage(), "error");
        } catch (Exception e) {
            log.error(">>>> FALLO GENERAL AL ENVIAR EMAIL <<<<");
            e.printStackTrace(); // Crucial para ver el fallo en consola
            saveInternalNotification(subject, "Fallo de envío: " + e.getMessage(), "error");
        }
    }

    public void sendWhatsApp(String phone, String message) {
        log.info("Iniciando envío de WhatsApp hacia: {}", phone);
        // MOCK de API Externa (ej. Twilio)
        saveInternalNotification("WhatsApp", "Mensaje registrado para " + phone, "success");
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByDateDesc();
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByIsReadFalseOrderByDateDesc();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void clearAll() {
        notificationRepository.deleteAll();
    }

    public void saveInternalNotification(String title, String message, String type) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .date(new Date())
                .build();
        notificationRepository.save(notification);
    }
}
