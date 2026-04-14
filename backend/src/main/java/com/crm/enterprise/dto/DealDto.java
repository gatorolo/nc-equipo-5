package com.crm.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealDto {
    private String id;
    private String nombre;
    private Double monto;
    private String etapa;
    private String clienteId;
    private String empresa;
}
