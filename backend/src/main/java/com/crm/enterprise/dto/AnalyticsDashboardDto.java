package com.crm.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDashboardDto {
    private List<KpiItemDto> kpis;
    private List<FunnelStageDto> etapasFunnel;
    private List<TopDealDto> topTratos;
    private List<ActiveClientDto> clientesActivos;
    private List<ActivityItemDto> actividades;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KpiItemDto {
        private String titulo;
        private String valor;
        private Double tendencia;
        private String icono;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FunnelStageDto {
        private String nombre;
        private Long cantidad;
        private Integer porcentaje;
        private Double monto;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopDealDto {
        private Long id;
        private String nombre;
        private String empresa;
        private String etapa;
        private Double monto;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActiveClientDto {
        private ClientSummaryDto cliente;
        private Long cantidadTratos;
        private Double montoTotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClientSummaryDto {
        private Long id;
        private String nombre;
        private String empresa;
        private String avatar;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityItemDto {
        private String descripcion;
        private String fecha;
        private String tipo;
        private String icono;
        private java.time.LocalDateTime createdAt;
    }
}
