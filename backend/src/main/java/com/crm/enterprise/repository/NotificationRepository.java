package com.crm.enterprise.repository;

import com.crm.enterprise.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByIsReadFalseOrderByDateDesc();
    List<Notification> findAllByOrderByDateDesc();
    long countByIsReadFalse();
}
