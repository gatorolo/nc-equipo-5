package com.crm.enterprise.config;

import com.crm.enterprise.entity.Client;
import com.crm.enterprise.entity.Deal;
import com.crm.enterprise.entity.Notification;
import com.crm.enterprise.repository.ClientRepository;
import com.crm.enterprise.repository.DealRepository;
import com.crm.enterprise.repository.NotificationRepository;
import com.crm.enterprise.repository.PipelineStageRepository;
import com.crm.enterprise.entity.PipelineStage;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PipelineStageRepository stageRepository;
    private final ClientRepository clientRepository;
    private final DealRepository dealRepository;
    private final NotificationRepository notificationRepository;
    private final com.crm.enterprise.repository.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Inicializar Etapas del Pipeline (Estructural)
        if (stageRepository.count() == 0) {
            PipelineStage s1 = PipelineStage.builder().nombre("Prospecto").color("bg-blue-400").orden(0).build();
            PipelineStage s2 = PipelineStage.builder().nombre("Negociación").color("bg-amber-400").orden(1).build();
            PipelineStage s3 = PipelineStage.builder().nombre("Propuesta").color("bg-purple-400").orden(2).build();
            PipelineStage s4 = PipelineStage.builder().nombre("Cerrado").color("bg-emerald-400").orden(3).build();
            stageRepository.saveAll(List.of(s1, s2, s3, s4));
            System.out.println("DataSeeder: Etapas iniciales creadas.");
        }

        // --- Seed Admin User (Independiente de los datos de prueba) ---
        if (!userRepository.existsByEmail("rodrigodaremberg@gmail.com")) {
            com.crm.enterprise.entity.User admin = com.crm.enterprise.entity.User.builder()
                    .name("Rodrigo Daremberg")
                    .email("rodrigodaremberg@gmail.com")
                    .password(passwordEncoder.encode("Research21@"))
                    .role(com.crm.enterprise.entity.User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("DataSeeder: Administrador principal verificado/creado.");
        }

        if (clientRepository.count() == 0) {
            // Seed Clients
            Client c1 = Client.builder()
                    .nombre("Juan Torres")
                    .empresa("TechCorp")
                    .email("juan@techcorp.com")
                    .telefono("555-0101")
                    .estado(Client.Status.Activo)
                    .avatarUrl("https://i.pravatar.cc/150?img=11")
                    .build();

            Client c2 = Client.builder()
                    .nombre("Maria Gomez")
                    .empresa("Innovate Inc")
                    .email("maria@innovate.com")
                    .telefono("555-0202")
                    .estado(Client.Status.Activo)
                    .avatarUrl("https://i.pravatar.cc/150?img=5")
                    .build();

            clientRepository.saveAll(List.of(c1, c2));

            PipelineStage sPros = stageRepository.findByNombre("Prospecto").get();
            PipelineStage sNego = stageRepository.findByNombre("Negociación").get();
            PipelineStage sCerr = stageRepository.findByNombre("Cerrado").get();

            // Seed Deals
            Deal d1 = Deal.builder()
                    .nombre("Rediseño Web")
                    .monto(5000.0)
                    .etapa(sPros)
                    .empresa("TechCorp")
                    .client(c1)
                    .build();

            Deal d2 = Deal.builder()
                    .nombre("Sistema Interno CRM")
                    .monto(12000.0)
                    .etapa(sNego)
                    .empresa("Innovate Inc")
                    .client(c2)
                    .build();

            Deal d3 = Deal.builder()
                    .nombre("Auditoría de Seguridad")
                    .monto(3000.0)
                    .etapa(sCerr)
                    .empresa("TechCorp")
                    .client(c1)
                    .build();

            dealRepository.saveAll(List.of(d1, d2, d3));

            // Seed Notifications
            Notification n1 = Notification.builder()
                    .title("Nuevo Trato Creado")
                    .message("Se ha creado el trato Rediseño Web")
                    .type("info")
                    .isRead(false)
                    .date(new Date())
                    .build();

            Notification n2 = Notification.builder()
                    .title("Reunión Confirmada")
                    .message("Revisar propuesta para Innovate Inc")
                    .type("warning")
                    .isRead(false)
                    .date(new Date())
                    .build();

            notificationRepository.saveAll(List.of(n1, n2));
            
            System.out.println("DataSeeder: Datos de prueba insertados en la base de datos.");
        }
    }
}
