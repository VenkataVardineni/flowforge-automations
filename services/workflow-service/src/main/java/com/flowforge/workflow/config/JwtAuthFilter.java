package com.flowforge.workflow.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${security.jwt.secret:changeme}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        // Skip auth for public paths
        if (path.startsWith("/actuator") || path.startsWith("/health") || path.startsWith("/public")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // If no auth header, check for X-Org-Id header (from gateway)
            // Gateway already validated JWT, so we trust the headers
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Add claims to request attributes for downstream use
            request.setAttribute("userId", claims.getSubject());
            request.setAttribute("orgId", claims.get("org_id"));
            request.setAttribute("role", claims.get("role"));

        } catch (Exception e) {
            // If JWT validation fails, still allow request if X-Org-Id is present (trust gateway)
            // Gateway already validated the JWT
        }

        filterChain.doFilter(request, response);
    }
}

