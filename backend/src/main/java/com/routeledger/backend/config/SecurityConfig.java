package com.routeledger.backend.config;

import com.routeledger.backend.security.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CorsConfig corsConfig;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public routes
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()

                        // User management
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/users/*/role").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users").hasAnyRole("SYSTEM_ADMIN", "FINANCE_ADMIN")

                        // Driver management
                        .requestMatchers(HttpMethod.POST, "/api/v1/drivers/**").hasAnyRole("SYSTEM_ADMIN", "DISPATCHER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/drivers/**").hasAnyRole("SYSTEM_ADMIN", "DISPATCHER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/drivers/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/drivers/**").hasAnyRole("SYSTEM_ADMIN", "DISPATCHER", "FINANCE_ADMIN")

                        // Trip management
                        .requestMatchers(HttpMethod.POST, "/api/v1/trips/**").hasAnyRole("SYSTEM_ADMIN", "DISPATCHER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/trips/**").hasAnyRole("SYSTEM_ADMIN", "DISPATCHER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/trips/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/trips/**").hasAnyRole("SYSTEM_ADMIN", "DISPATCHER", "FINANCE_ADMIN")

                        // Ledger — finance only
                        .requestMatchers(HttpMethod.POST, "/api/v1/ledger/**").hasAnyRole("SYSTEM_ADMIN", "FINANCE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/ledger/**").hasAnyRole("SYSTEM_ADMIN", "FINANCE_ADMIN")

                        // AI Predictor
                        .requestMatchers("/api/v1/predictor/**").hasAnyRole("SYSTEM_ADMIN", "DISPATCHER")

                        // Alert
                        .requestMatchers("/api/v1/alerts/**").hasAnyRole("SYSTEM_ADMIN", "DISPATCHER", "FINANCE_ADMIN")
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs"
                        ).permitAll()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}