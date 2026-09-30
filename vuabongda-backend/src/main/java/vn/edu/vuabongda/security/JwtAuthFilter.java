package vn.edu.vuabongda.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.edu.vuabongda.user.entity.User;
import vn.edu.vuabongda.user.repository.UserRepository;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final UserRepository userRepository;

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                jwtSecret.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }

    // ================================
    // KHONG LOC AUTH ENDPOINT
    // ================================
    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {

        String path =
                request.getRequestURI();

        return path.equals(
                "/api/auth/login"
        )
                || path.equals(
                "/api/auth/register"
        );
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // ================================
        // 1. DOC AUTHORIZATION
        // ================================
        String authHeader =
                request.getHeader(
                        "Authorization"
                );

        if (
                authHeader == null ||
                        !authHeader.startsWith(
                                "Bearer "
                        )
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // ================================
        // 2. LAY TOKEN
        // ================================
        String token =
                authHeader
                        .substring(7)
                        .trim();

        if (token.isBlank()) {

            response.setStatus(
                    HttpServletResponse
                            .SC_UNAUTHORIZED
            );

            return;
        }

        try {

            // ================================
            // 3. VERIFY JWT
            // ================================
            Claims claims =
                    Jwts.parser()
                            .verifyWith(
                                    getSigningKey()
                            )
                            .build()
                            .parseSignedClaims(
                                    token
                            )
                            .getPayload();

            // ================================
            // 4. DOC CLAIM
            // ================================
            String tokenUsername =
                    claims.getSubject();

            Number userIdClaim =
                    claims.get(
                            "userId",
                            Number.class
                    );

            if (
                    userIdClaim == null ||
                            tokenUsername == null ||
                            tokenUsername.isBlank()
            ) {

                response.setStatus(
                        HttpServletResponse
                                .SC_UNAUTHORIZED
                );

                return;
            }

            Long userId =
                    userIdClaim.longValue();

            // ================================
            // 5. DOC USER THUC TE TU DATABASE
            // ================================
            User user =
                    userRepository
                            .findById(userId)
                            .orElse(null);

            if (user == null) {

                response.setStatus(
                        HttpServletResponse
                                .SC_UNAUTHORIZED
                );

                return;
            }

            // Token khong con khop user
            if (
                    !user.getUsername()
                            .equals(
                                    tokenUsername
                            )
            ) {

                response.setStatus(
                        HttpServletResponse
                                .SC_UNAUTHORIZED
                );

                return;
            }

            // ================================
            // 6. TAI KHOAN BI KHOA
            // TOKEN CU CUNG KHONG DUNG DUOC
            // ================================
            if (
                    !"ACTIVE".equals(
                            user.getStatus()
                    )
            ) {

                SecurityContextHolder
                        .clearContext();

                response.setStatus(
                        HttpServletResponse
                                .SC_UNAUTHORIZED
                );

                return;
            }

            // ================================
            // 7. LAY ROLE MOI NHAT TU DATABASE
            // ================================
            String role =
                    user.getRole();

            List<SimpleGrantedAuthority>
                    authorities;

            if (
                    role != null &&
                            !role.isBlank()
            ) {

                String authority =
                        role.startsWith(
                                "ROLE_"
                        )
                                ? role
                                : "ROLE_" + role;

                authorities =
                        List.of(
                                new SimpleGrantedAuthority(
                                        authority
                                )
                        );

            } else {

                authorities =
                        List.of();
            }

            // ================================
            // 8. TAO AUTHENTICATION
            // ================================
            if (
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication()
                            == null
            ) {

                UsernamePasswordAuthenticationToken
                        authentication =
                        new UsernamePasswordAuthenticationToken(
                                user.getUsername(),

                                // credentials luu userId
                                // de controller biet ai dang thao tac
                                user.getId(),

                                authorities
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );
            }

        } catch (Exception e) {

            SecurityContextHolder
                    .clearContext();

            response.setStatus(
                    HttpServletResponse
                            .SC_UNAUTHORIZED
            );

            return;
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}