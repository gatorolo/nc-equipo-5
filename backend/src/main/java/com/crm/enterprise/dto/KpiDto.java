package com.crm.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiDto {
    private String titulo;
    private Object valor; // Puede ser número o string como "$45,200"
    private Double tendencia;
    private String icono;
}
