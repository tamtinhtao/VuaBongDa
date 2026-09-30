package vn.edu.vuabongda.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import vn.edu.vuabongda.security.JwtAuthFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                // ================================
                // BASIC CONFIG
                // ================================
                .cors(cors -> {
                })

                .csrf(csrf ->
                        csrf.disable()
                )

                .formLogin(form ->
                        form.disable()
                )

                .httpBasic(basic ->
                        basic.disable()
                )

                // ================================
                // STATELESS
                // ================================
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // ================================
                // ERROR 401 / 403
                // ================================
                .exceptionHandling(ex -> ex

                        .authenticationEntryPoint(
                                (
                                        request,
                                        response,
                                        authException
                                ) -> {

                                    response.setStatus(
                                            HttpServletResponse.SC_UNAUTHORIZED
                                    );
                                }
                        )

                        .accessDeniedHandler(
                                (
                                        request,
                                        response,
                                        accessDeniedException
                                ) -> {

                                    response.setStatus(
                                            HttpServletResponse.SC_FORBIDDEN
                                    );
                                }
                        )
                )

                // ================================
                // PHAN QUYEN
                // ================================
                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // PUBLIC AUTH
                        // =========================
                        .requestMatchers(
                                "/api/auth/**"
                        )
                        .permitAll()

                        // =========================
                        // PUBLIC IMAGE
                        // =========================
                        .requestMatchers(
                                "/uploads/**"
                        )
                        .permitAll()

                        // =========================
                        // PUBLIC CATEGORY - GET
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categories/**"
                        )
                        .permitAll()

                        // =========================
                        // PUBLIC PRODUCT - GET
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products/**"
                        )
                        .permitAll()

                        // =========================
                        // ADMIN - TAT CA /api/admin/**
                        // =========================
                        // Bao gom:
                        // /api/admin/orders/**
                        // /api/admin/users/**
                        // /api/admin/promotions/**
                        // va cac API admin sau nay
                        // =========================
                        .requestMatchers(
                                "/api/admin/**"
                        )
                        .hasRole("ADMIN")

                        // =========================
                        // ADMIN - CATEGORY
                        // =========================
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/categories/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/categories/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/categories/**"
                        )
                        .hasRole("ADMIN")

                        // =========================
                        // ADMIN - PRODUCT
                        // =========================
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/products/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/products/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/products/**"
                        )
                        .hasRole("ADMIN")

                        // =========================
                        // CUSTOMER - CART
                        // =========================
                        .requestMatchers(
                                "/api/cart/**"
                        )
                        .hasRole("CUSTOMER")

                        // =========================
                        // CUSTOMER - ORDER
                        // =========================
                        .requestMatchers(
                                "/api/orders/**"
                        )
                        .hasRole("CUSTOMER")

                        // =========================
                        // CUSTOMER - PAYMENT
                        // =========================
                        .requestMatchers(
                                "/api/payments/**"
                        )
                        .hasRole("CUSTOMER")

                        // =========================
                        // CAC API CON LAI
                        // PHAI DANG NHAP
                        // =========================
                        .anyRequest()
                        .authenticated()
                )

                // ================================
                // JWT FILTER
                // ================================
                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // ================================
    // PASSWORD ENCODER
    // ================================
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}