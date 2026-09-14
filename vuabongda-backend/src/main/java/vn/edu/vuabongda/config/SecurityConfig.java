package vn.edu.vuabongda.config;

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
import jakarta.servlet.http.HttpServletResponse;
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())

                .formLogin(form -> form.disable())

                .httpBasic(basic -> basic.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .exceptionHandling(ex -> ex

                        .authenticationEntryPoint(
                                (request, response, authException) -> {
                                    response.setStatus(
                                            HttpServletResponse.SC_UNAUTHORIZED
                                    );
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {
                                    response.setStatus(
                                            HttpServletResponse.SC_FORBIDDEN
                                    );
                                }
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // PUBLIC AUTH
                        // =========================
                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        // =========================
                        // PUBLIC IMAGES
                        // =========================
                        .requestMatchers("/uploads/**")
                        .permitAll()

                        // =========================
                        // PUBLIC CATEGORY
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categories/**"
                        )
                        .permitAll()

                        // =========================
                        // PUBLIC PRODUCT
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products/**"
                        )
                        .permitAll()

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
                        .requestMatchers("/api/admin/orders/**")
                        .hasRole("ADMIN")
                        .requestMatchers("/api/cart/**")
                        .hasRole("CUSTOMER")
                        .requestMatchers("/api/orders/**")
                        .hasRole("CUSTOMER")
                        .requestMatchers("/api/payments/**")
                        .hasRole("CUSTOMER")
                        // Các API khác phải đăng nhập
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}