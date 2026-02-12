package com.flowforge.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    @Value("${security.jwt.secret:changeme}")
    private String jwtSecret;

    public JwtAuthenticationGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getPath().value();
            String method = exchange.getRequest().getMethod().name();
            
            // Allow OPTIONS requests for CORS preflight
            if ("OPTIONS".equals(method)) {
                return chain.filter(exchange);
            }
            
            // Skip auth for public paths
            if (path.startsWith("/actuator") || path.startsWith("/auth") || path.startsWith("/public") || "/health".equals(path)) {
                return chain.filter(exchange);
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ServerHttpResponse response = exchange.getResponse();
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return response.setComplete();
            }

            String token = authHeader.substring(7);

            try {
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                // Add claims to request headers for downstream services
                return chain.filter(exchange.mutate()
                        .request(exchange.getRequest().mutate()
                                .header("X-User-Id", claims.getSubject())
                                .header("X-Org-Id", claims.get("org_id") != null ? String.valueOf(claims.get("org_id")) : "")
                                .header("X-User-Role", claims.get("role") != null ? String.valueOf(claims.get("role")) : "")
                                .build())
                        .build());

            } catch (Exception e) {
                ServerHttpResponse response = exchange.getResponse();
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return response.setComplete();
            }
        };
    }

    public static class Config {
        // Configuration properties if needed
    }
}

