package com.crm.enterprise.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pipeline_stages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PipelineStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private String color;

    private Integer orden;
}
