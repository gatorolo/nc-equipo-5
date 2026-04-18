package com.crm.enterprise.config;

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


    }
}
