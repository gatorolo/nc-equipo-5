package com.crm.enterprise.repository;

import com.crm.enterprise.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Client> findTop5ByOrderByCreatedAtDesc();
}
