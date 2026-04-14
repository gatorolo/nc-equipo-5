package com.crm.enterprise.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String empresa;

    @Column(nullable = false, unique = true)
    private String email;

    private String telefono;

    @Enumerated(EnumType.STRING)
    private Status estado;

    @JsonProperty("avatar")
    private String avatarUrl;

    @JsonProperty("ultimaInteraccion")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastInteraction;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Para evitar recursión infinita
    private List<Deal> deals;

    public enum Status {
        Activo, Inactivo
    }
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (estado == null) {
            estado = Status.Activo;
        }
        if (lastInteraction == null) {
            lastInteraction = new Date();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
