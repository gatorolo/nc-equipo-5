package com.crm.enterprise.service;

import com.crm.enterprise.dto.AnalyticsDashboardDto;
import com.crm.enterprise.dto.AnalyticsDashboardDto.*;
import com.crm.enterprise.entity.Client;
import com.crm.enterprise.entity.Deal;
import com.crm.enterprise.repository.ClientRepository;
import com.crm.enterprise.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.crm.enterprise.entity.PipelineStage;
import com.crm.enterprise.repository.PipelineStageRepository;
import java.time.LocalDateTime;
import java.text.NumberFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final DealRepository dealRepository;
    private final ClientRepository clientRepository;
    private final PipelineStageRepository stageRepository;

    public AnalyticsDashboardDto buildDashboard() {
        List<KpiItemDto> kpis = calculateKpis();
        List<FunnelStageDto> funnel = calculateFunnel();
        List<TopDealDto> topDeals = getTopDeals();
        List<ActiveClientDto> activeClients = getActiveClients();
        List<ActivityItemDto> activities = getActivities();
        
        return AnalyticsDashboardDto.builder()
                .kpis(kpis)
                .etapasFunnel(funnel)
                .topTratos(topDeals)
                .clientesActivos(activeClients)
                .actividades(activities)
                .build();
    }

    private List<KpiItemDto> calculateKpis() {
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
        nf.setMaximumFractionDigits(0);

        // Periodos
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime firstDayCurrent = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime firstDayLast = firstDayCurrent.minusMonths(1);
        LocalDateTime lastDayLast = firstDayCurrent.minusSeconds(1);

        // 1. Pipeline Total y Tendencia
        Double currentPipeline = dealRepository.sumMontoByPeriod(firstDayCurrent, now);
        if (currentPipeline == null) currentPipeline = 0.0;
        Double lastPipeline = dealRepository.sumMontoByPeriod(firstDayLast, lastDayLast);
        if (lastPipeline == null) lastPipeline = 0.0;
        
        double pipelineTrend = calculateTrend(currentPipeline, lastPipeline);
        
        Double totalPipe = dealRepository.sumMontoByPeriod(firstDayCurrent, now); // Re-usar variable para coherencia
        if (totalPipe == null) totalPipe = 0.0;

        KpiItemDto kpi1 = KpiItemDto.builder()
                .titulo("Pipeline Mensual")
                .valor("$" + nf.format(currentPipeline))
                .tendencia(pipelineTrend)
                .icono("pipeline")
                .color("from-blue-500 to-blue-600")
                .build();

        // 2. Ingresos Cerrados y Tendencia
        Double currentRevenue = dealRepository.sumIngresosByPeriod(firstDayCurrent, now);
        if (currentRevenue == null) currentRevenue = 0.0;
        Double lastRevenue = dealRepository.sumIngresosByPeriod(firstDayLast, lastDayLast);
        if (lastRevenue == null) lastRevenue = 0.0;

        double revenueTrend = calculateTrend(currentRevenue, lastRevenue);
        
        Double totalClosed = dealRepository.sumMontoClosedDeals();
        if (totalClosed == null) totalClosed = 0.0;

        KpiItemDto kpi2 = KpiItemDto.builder()
                .titulo("Ingresos del Mes")
                .valor("$" + nf.format(currentRevenue))
                .tendencia(Math.round(revenueTrend * 10.0) / 10.0)
                .icono("revenue")
                .color("from-emerald-500 to-emerald-600")
                .build();

        // 3. Ticket Promedio
        long totalDeals = dealRepository.count();
        double totalSum = totalPipe + totalClosed;
        long avgTicket = totalDeals > 0 ? (long)(totalSum / totalDeals) : 0;
        
        KpiItemDto kpi3 = KpiItemDto.builder()
                .titulo("Ticket Promedio")
                .valor("$" + nf.format(avgTicket))
                .tendencia(2.5) // Se podría calcular histórico también
                .icono("ticket")
                .color("from-purple-500 to-purple-600")
                .build();

        // 4. Tasa de Conversión
        Long closedCount = dealRepository.countClosedDeals();
        if (closedCount == null) closedCount = 0L;
        long convRate = totalDeals > 0 ? (closedCount * 100 / totalDeals) : 0;
        
        KpiItemDto kpi4 = KpiItemDto.builder()
                .titulo("Tasa de Conversión")
                .valor(convRate + "%")
                .tendencia(convRate > 10 ? 1.2 : -0.5)
                .icono("conversion")
                .color("from-amber-500 to-amber-600")
                .build();

        return Arrays.asList(kpi1, kpi2, kpi3, kpi4);
    }

    private List<FunnelStageDto> calculateFunnel() {
        List<Object[]> stats = dealRepository.getFunnelStats();
        long totalDeals = dealRepository.count();
        
        // Mapear resultados reales de la DB
        Map<String, FunnelStageDto> resultsMap = new HashMap<>();
        for (Object[] row : stats) {
            String etapaNombre = (String) row[0];
            Long count = (Long) row[1];
            Double sum = (Double) row[2];
            resultsMap.put(etapaNombre, FunnelStageDto.builder()
                .nombre(etapaNombre)
                .cantidad(count)
                .monto(sum != null ? sum : 0.0)
                .porcentaje(totalDeals > 0 ? (int)((count * 100) / totalDeals) : 0)
                .build());
        }

        // Obtener todas las etapas configuradas para asegurar el color y el orden
        List<PipelineStage> allStages = stageRepository.findAllByOrderByOrdenAsc();
        List<FunnelStageDto> funnel = new ArrayList<>();
        
        for (PipelineStage stage : allStages) {
            FunnelStageDto dto = resultsMap.getOrDefault(stage.getNombre(), FunnelStageDto.builder()
                .nombre(stage.getNombre())
                .cantidad(0L)
                .monto(0.0)
                .porcentaje(0)
                .build());
            dto.setColor(stage.getColor());
            funnel.add(dto);
        }
        
        return funnel;
    }

    private List<TopDealDto> getTopDeals() {
        return dealRepository.findTop5ByOrderByMontoDesc().stream().map(d -> 
            TopDealDto.builder()
                .id(d.getId())
                .nombre(d.getNombre())
                .empresa(d.getEmpresa())
                .etapa(d.getEtapa() != null ? d.getEtapa().getNombre() : "S/E")
                .monto(d.getMonto())
                .build()
        ).collect(Collectors.toList());
    }

    private List<ActiveClientDto> getActiveClients() {
        List<Object[]> clientStats = dealRepository.findTopClientsStats(PageRequest.of(0, 5));
        List<ActiveClientDto> activeClients = new ArrayList<>();
        
        for (Object[] row : clientStats) {
            Client c = (Client) row[0];
            Long count = (Long) row[1];
            Double totalAmount = (Double) row[2];
            
            ClientSummaryDto summary = ClientSummaryDto.builder()
                .id(c.getId())
                .nombre(c.getNombre())
                .empresa(c.getEmpresa())
                .avatar(c.getAvatarUrl() != null ? c.getAvatarUrl() : "https://i.pravatar.cc/150?u=" + c.getId())
                .build();
                
            activeClients.add(ActiveClientDto.builder()
                .cliente(summary)
                .cantidadTratos(count)
                .montoTotal(totalAmount != null ? totalAmount : 0.0)
                .build());
        }
        return activeClients;
    }

    private List<ActivityItemDto> getActivities() {
        List<ActivityItemDto> allActivities = new ArrayList<>();
        
        // 1. Obtener clientes recientes
        clientRepository.findTop5ByOrderByCreatedAtDesc().forEach(c -> {
            allActivities.add(ActivityItemDto.builder()
                .descripcion("Nuevo cliente registrado: " + c.getNombre())
                .fecha(formatDate(c.getCreatedAt()))
                .tipo("client")
                .icono("👤")
                .createdAt(c.getCreatedAt())
                .build());
        });

        // 2. Obtener tratos recientes
        dealRepository.findTop5ByOrderByCreatedAtDesc().forEach(d -> {
            allActivities.add(ActivityItemDto.builder()
                .descripcion("Nueva oportunidad: " + d.getEmpresa() + " ($" + d.getMonto().intValue() + ")")
                .fecha(formatDate(d.getCreatedAt()))
                .tipo("deal")
                .icono("💰")
                .createdAt(d.getCreatedAt())
                .build());
        });

        // 3. Ordenar por fecha (más reciente arriba) y limitar a 6
        return allActivities.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(6)
            .collect(Collectors.toList());
    }

    private String formatDate(LocalDateTime date) {
        if (date == null) return "AHORA";
        LocalDateTime now = LocalDateTime.now();
        java.time.Duration duration = java.time.Duration.between(date, now);
        
        long seconds = duration.getSeconds();
        if (seconds < 60) return "HACE INSTANTES";
        
        long minutes = duration.toMinutes();
        if (minutes < 60) return "HACE " + minutes + " MINUTOS";
        
        long hours = duration.toHours();
        if (hours < 24) return "HACE " + hours + " HORAS";
        
        long days = duration.toDays();
        if (days == 1) return "HACE 1 DÍA";
        if (days < 30) return "HACE " + days + " DÍAS";
        
        return date.getDayOfMonth() + "/" + date.getMonthValue() + "/" + date.getYear();
    }

    private double calculateTrend(double current, double previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        double trend = ((current - previous) / previous) * 100.0;
        return Math.round(trend * 10.0) / 10.0;
    }
}
