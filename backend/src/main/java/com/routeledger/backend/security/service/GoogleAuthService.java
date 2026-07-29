package com.routeledger.backend.security.service;

import com.routeledger.backend.security.dto.AuthResponse;
import com.routeledger.backend.security.dto.GoogleLoginRequest;
import com.routeledger.backend.user.entity.User;
import com.routeledger.backend.user.enums.Role;
import com.routeledger.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final String googleClientId;

    public GoogleAuthService(UserRepository userRepository,
                             JwtService jwtService,
                             @Value("${spring.security.oauth2.client.registration.google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId;
    }

    @Transactional
    public AuthResponse authenticateGoogleUser(GoogleLoginRequest request) {
        try {
            Map payload = WebClient.create()
                    .get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?id_token=" + request.idToken())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (payload == null || !googleClientId.equals(payload.get("aud"))) {
                throw new IllegalArgumentException("Invalid Google ID Token");
            }

            String email = (String) payload.get("email");
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String googleSub = (String) payload.get("sub");

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .email(email)
                                    .name(name)
                                    .pictureUrl(pictureUrl)
                                    .googleSub(googleSub)
                                    .role(Role.DISPATCHER)
                                    .build()
                    ));

            String jwt = jwtService.generateToken(user);
            return new AuthResponse(jwt, user.getEmail(), user.getName(), user.getPictureUrl(), user.getRole());

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage(), e);
        }
    }
}