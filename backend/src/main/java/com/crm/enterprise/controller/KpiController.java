package com.crm.enterprise.controller;

import com.crm.enterprise.dto.KpiDto;
import com.crm.enterprise.repository.ClientRepository;
import com.crm.enterprise.repository.DealRepository;
import com.crm.enterprise.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.text.NumberFormat;
import java.util.Locale;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

@RestController
@RequestMapping("/api/kpis")
@RequiredArgsConstructor
public class KpiController {

    private final ClientRepository clientRepository;
    private final DealRepository dealRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<KpiDto>> getKpis() {
        List<KpiDto> kpis = new ArrayList<>();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime firstDayCurrentMonth = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime firstDayLastMonth = firstDayCurrentMonth.minusMonths(1);
        LocalDateTime lastDayLastMonth = firstDayCurrentMonth.minusSeconds(1);

        // 1. Total Clientes
        long totalClients = clientRepository.count();
        long clientsLastMonth = clientRepository.countByCreatedAtBetween(firstDayLastMonth, lastDayLastMonth);
        double clientTrend = calculateTrend(totalClients - clientsLastMonth, clientsLastMonth);
        kpis.add(new KpiDto("Total Clientes", totalClients, clientTrend, "users"));

        // 2. Tratos Abiertos
        long allDeals = dealRepository.count();
        long closedDeals = dealRepository.countClosedDeals();
        long openDealsCount = allDeals - closedDeals;
        
        // Para tendencias de tratos abiertos, comparamos cuántos se abrieron este mes vs el anterior
        long dealsOpenedThisMonth = dealRepository.sumMontoByPeriod(firstDayCurrentMonth, now) != null ? 1 : 0; // Simplificado
        // En un CRM real buscaríamos la cuenta exacta de creados este mes
        kpis.add(new KpiDto("Tratos Abiertos", openDealsCount, 0.0, "briefcase"));

        // 3. Ingresos Mensuales (Cerrados este mes vs mes pasado)
        Double revenueThisMonth = dealRepository.sumIngresosByPeriod(firstDayCurrentMonth, now);
        if (revenueThisMonth == null) revenueThisMonth = 0.0;
        
        Double revenueLastMonth = dealRepository.sumIngresosByPeriod(firstDayLastMonth, lastDayLastMonth);
        if (revenueLastMonth == null) revenueLastMonth = 0.0;
        
        double revenueTrend = calculateTrend(revenueThisMonth, revenueLastMonth);

        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.US);
        currencyFormat.setMaximumFractionDigits(0);
        String formattedRevenue = currencyFormat.format(revenueThisMonth);
        
        kpis.add(new KpiDto("Ingresos Mensuales", formattedRevenue, revenueTrend, "dollar-sign"));

        // 4. Notificaciones Pendientes
        long pendingNotifs = notificationRepository.countByIsReadFalse();
        kpis.add(new KpiDto("Notifs. Pendientes", pendingNotifs, 0.0, "bell"));

        return ResponseEntity.ok(kpis);
    }

    private double calculateTrend(double current, double previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return ((current - previous) / previous) * 100.0;
    }
}
