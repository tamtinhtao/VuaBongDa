package vn.edu.vuabongda.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                jwtSecret.getBytes(StandardCharsets.UTF_8)
        );
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // ================================
        // 1. DOC AUTHORIZATION HEADER
        // ================================
        String authHeader =
                request.getHeader("Authorization");

        // Không có Bearer Token
        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // ================================
        // 2. LAY TOKEN
        // ================================
        String token =
                authHeader.substring(7).trim();

        if (token.isBlank()) {
            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );
            return;
        }

        try {

            // ================================
            // 3. VERIFY JWT
            // ================================
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // ================================
            // 4. DOC CLAIM
            // ================================
            String username =
                    claims.getSubject();

            String role =
                    claims.get("role", String.class);

            Number userIdClaim =
                    claims.get("userId", Number.class);

            Long userId =
                    userIdClaim != null
                            ? userIdClaim.longValue()
                            : null;

            // ================================
            // 5. TAO AUTHENTICATION
            // ================================
            if (username != null
                    && !username.isBlank()
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                List<SimpleGrantedAuthority> authorities;

                if (role != null && !role.isBlank()) {

                    String authority =
                            role.startsWith("ROLE_")
                                    ? role
                                    : "ROLE_" + role;

                    authorities = List.of(
                            new SimpleGrantedAuthority(authority)
                    );

                } else {

                    authorities = List.of();
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                userId,
                                authorities
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception e) {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            return;
        }

        // ================================
        // 6. JWT HOP LE -> TIEP TUC
        // ================================
        filterChain.doFilter(request, response);
    }
}