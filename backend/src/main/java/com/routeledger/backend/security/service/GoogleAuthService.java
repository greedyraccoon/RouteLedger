package com.routeledger.backend.security.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.routeledger.backend.security.dto.AuthResponse;
import com.routeledger.backend.security.dto.GoogleLoginRequest;
import com.routeledger.backend.user.entity.Role;
import com.routeledger.backend.user.entity.User;
import com.routeledger.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final String googleClientId;

    public GoogleAuthService(UserRepository userRepository,
                             JwtService jwtService,
                             @Value("${spring.security.oauth2.client.registration.google.client-id:dummy-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId;
    }

    @Transactional
    public AuthResponse authenticateGoogleUser(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.idToken());
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google ID Token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String googleSub = payload.getSubject();

            // Find or create user in our PostgreSQL database
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

            // Generate our backend JWT
            String jwt = jwtService.generateToken(user);

            return new AuthResponse(jwt, user.getEmail(), user.getName(), user.getPictureUrl(), user.getRole());

        } catch (Exception e) {
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage(), e);
        }
    }
}