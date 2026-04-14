package com.crm.enterprise.repository;

import com.crm.enterprise.entity.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DealRepository extends JpaRepository<Deal, Long> {

    @Query("SELECT SUM(d.monto) FROM Deal d WHERE d.etapa.nombre != 'Cerrado'")
    Double sumMontoOpenDeals();

    @Query("SELECT COUNT(d) FROM Deal d WHERE d.etapa.nombre = 'Cerrado'")
    Long countClosedDeals();

    @Query("SELECT SUM(d.monto) FROM Deal d WHERE d.etapa.nombre = 'Cerrado'")
    Double sumMontoClosedDeals();

    @Query("SELECT SUM(d.monto) FROM Deal d WHERE d.createdAt BETWEEN :start AND :end")
    Double sumMontoByPeriod(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Query("SELECT SUM(d.monto) FROM Deal d WHERE d.etapa.nombre = 'Cerrado' AND d.createdAt BETWEEN :start AND :end")
    Double sumIngresosByPeriod(java.time.LocalDateTime start, java.time.LocalDateTime end);

    List<Deal> findTop5ByOrderByMontoDesc();

    List<Deal> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT d.etapa.nombre, COUNT(d), SUM(d.monto) FROM Deal d GROUP BY d.etapa.nombre")
    List<Object[]> getFunnelStats();

    @Query("SELECT d.client, COUNT(d), SUM(d.monto) FROM Deal d GROUP BY d.client ORDER BY SUM(d.monto) DESC")
    List<Object[]> findTopClientsStats(org.springframework.data.domain.Pageable pageable);
}
