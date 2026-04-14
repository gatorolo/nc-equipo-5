package com.crm.enterprise.service;

import com.crm.enterprise.dto.AuthRequest;
import com.crm.enterprise.dto.AuthResponse;
import com.crm.enterprise.dto.RegisterRequest;
import com.crm.enterprise.entity.User;
import com.crm.enterprise.repository.UserRepository;
import com.crm.enterprise.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    public void forgotPassword(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        repository.save(user);

        String resetUrl = "http://localhost:4200/?resetToken=" + token;
        String body = "Hola " + user.getName() + ",\n\n" +
                "Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:\n" +
                resetUrl + "\n\n" +
                "Este enlace expirará en 15 minutos.\n\n" +
                "Si no solicitaste esto, puedes ignorar este correo.";

        notificationService.sendEmail(user.getEmail(), "Recuperación de Contraseña CRM", body);
    }

    public void resetPassword(String token, String newPassword) {
        User user = repository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        repository.save(user);
    }

    public AuthResponse register(RegisterRequest request) {
        if(repository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already taken");
        }

        var user = User.builder()
                .name(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.ADMIN) // Defaults to Admin for MVP
                .build();
                
        repository.save(user);
        var jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }
}
