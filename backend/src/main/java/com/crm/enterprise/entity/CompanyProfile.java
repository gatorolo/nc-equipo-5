package com.crm.enterprise.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombreComercial;

    private String razonSocial;
    private String cuit;
    private String direccion;
    private String telefono;
    private String sitioWeb;
}
